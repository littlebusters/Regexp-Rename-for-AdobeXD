const fs = require("uxp").storage.localFileSystem;
const historyFile = 'history.json';
const dom = sel => document.querySelector(sel);
const {uiLabel} = require('./i18l');
const pluginIcon = '../images/pluginIcon2.png';

function createDialog(history) {
	let global_checked = (history.global) ? ' checked' : '';
	let ignore_checked = (history.ignore) ? ' checked' : '';

	document.body.innerHTML = `
<style>
	dialog {
		display: flex;
		flex-direction: row-reverse;
	}
	#title {
		margin-bottom: 16px;
		padding-bottom: 7px;
		border-bottom: 1px solid #ccc;
		font-size: 16px;
	}
	h2 {
		margin-top: 20px;
	}
	label {
		padding-top: 8px;
	}
	.renameValues {
		width: 300px;
		margin: 8px 2px;
	}
	.toggleInput {
		padding: 0 !important;
	}
	.formgroup {
		padding: 0 8px 8px;
	}
	.plugin-icon {
		width: 48px;
		height: 48px;
		margin-right: 16px;
		border-radius: 4px;
		background-image: url(${pluginIcon});
		background-repeat: no-repeat;
		background-size: cover;
	}
</style>
<dialog id="dialog">
	<form id="form" method="dialog">
		<h1 id="title">${uiLabel.REGEX_RENAME_TITLE}</h1>
		<div class="formgroup">
			<label for="find">${uiLabel.REGEX_RENAME_LABEL_FIND}</label>
			<input id="find" type="text" class="renameValues" value="${history.find}" />

			<label for="global" class="row toggleInput">
				<input type="checkbox" id="global" value="g"${global_checked}>
				<span>${uiLabel.REGEX_RENAME_LABEL_GLOBAL}</span>
			</label>
			<label for="ignore" class="row toggleInput">
				<input type="checkbox" id="ignore" value="i"${ignore_checked}>
				<span>${uiLabel.REGEX_RENAME_LABEL_IGNORE}</span>
			</label>

			<label for="replace">${uiLabel.REGEX_RENAME_LABEL_REPLACE}</label>
			<input id="replace" type="text" class="renameValues" value="${history.replace}" />
		</div>
		<footer>
			<button id="cancel">Cancel</button>
			<button id="save" type="submit" uxp-variant="cta">Rename</button>
		</footer>
	</form>
	<div class="plugin-icon"></div>
</dialog>
`;
	const dialog = dom('#dialog');
	const form = dom('#form');
	const find = dom('#find');
	const replace = dom('#replace');
	const globalMatch = dom('#global');
	const ignore = dom('#ignore');
	const cancel = dom('#cancel');
	const save = dom('#save');

	// Cancel button event
	const cancelDialog = () => dialog.close('reasonCanceled');
	cancel.addEventListener('click', cancelDialog);

	// OK button event
	const confirmedDialog = (e) => {
		let history = {};
		history.find = find.value;
		history.replace = replace.value;
		history.global = globalMatch.checked;
		history.ignore = ignore.checked;

		dialog.close(history);
		e.preventDefault();
	};
	save.addEventListener('click', confirmedDialog);

	form.onsubmit = confirmedDialog;

	return dialog;

}

async function openDialog() {
	const history = await readHistory();
	const dialog = createDialog(history);

	try {
		const result = await dialog.showModal();
		if ('reasonCanceled' !== result) {
			await writeHistory(result);

			return result;
		} else {
			return false;
		}
	} catch(e) {
		console.log(e);
		return false;
	}
}

function createAlert(title, msg) {
	document.body.innerHTML = `
<style>
    dialog {
        display: flex;
        flex-direction: row-reverse;
    }
    #title {
        padding-bottom: 7px;
        border-bottom: 1px solid #ccc;
        font-size: 14px;
    }
    .plugin-icon {
        width: 48px;
        height: 48px;
        margin-right: 16px;
        border-radius: 4px;
        background-image: url(${pluginIcon});
        background-repeat: no-repeat;
        background-size: cover;
    }
</style>
<dialog id="dialog">
	<form id="form" method="dialog">
		<h1 id="title">${uiLabel[title]}</h1>
		<p>${uiLabel[msg]}</p>
		<footer>
			<button id="ok" type="submit" uxp-variant="cta">OK</button>
		</footer>
	</form>
	<div class="plugin-icon"></div>
</dialog>
`;
	const dialog = dom('#dialog');
	const ok = dom('#ok');
	const cancelDialog = () => dialog.close();
	ok.addEventListener('click', cancelDialog);

	return dialog;
}

async function readHistory() {
	let entry = await openFile();

	if (entry) {
		let history = JSON.parse(await entry.read());

		return history;
	} else {
		// Set and return initial values if history.json is not found
		let initialVal = {"find": "", "replace": "", "global": true, "ignore": false};
		const pluginDataFolder = await fs.getDataFolder();
		const buffer = await pluginDataFolder.createFile(historyFile);
		buffer.write(JSON.stringify(initialVal));

		return initialVal;
	}
}

async function writeHistory(val) {
	let entry = await openFile();

	if (entry) {
		await entry.write(JSON.stringify(val));

		return true;
	} else {
		// Create file and write value if history.json is not found
		const pluginDataFolder = await fs.getDataFolder();
		const buffer = await pluginDataFolder.createFile(historyFile);
		buffer.write(JSON.stringify(val));

		return true;
	}
}

async function openFile() {
	const pluginDataFolder = await fs.getDataFolder();
	const entries = await pluginDataFolder.getEntries();

	for (const entry of entries) {
		if (historyFile === entry.name) {
			return entry;
		}
	}
}

module.exports = {
	openDialog,
	createAlert
}
