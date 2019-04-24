const {openDialog, createAlert} = require('./modules/helper');

async function regexpRename (selection) {
	let sel = selection.items;
	const isSelection = sel.length;
	if (!isSelection) {
		const alertDialog = createAlert('ALERT_NO_SELECTION_TITLE', 'ALERT_NO_SELECTION_BODY');
		alertDialog.showModal();
		return false;
	}

	const renameVals = await openDialog();

	if (renameVals) {
		const flags = renameVals.global ? 'g' : '' + renameVals.ignore ? 'i' : '';
		const regexp = new RegExp(renameVals.find, flags);

		sel.forEach(function (item) {
			item.name = item.name.replace(regexp, renameVals.replace)
		});
	}
}

module.exports = {
	commands: {
		regexpRename: regexpRename
	}
};
