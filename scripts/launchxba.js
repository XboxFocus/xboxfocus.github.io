import {
	urlParams,
	pid,
	getActualPID,
	getCachedAppsFolderID,
	getCachedGameExe
} from './common.js';

const launchButton = document.getElementById('launchbutton');
launchButton.addEventListener('click', async () => {
	try {
		let mypid = getActualPID(pid);
		if (mypid.length > 0) {
			let appsfolderid = await getCachedAppsFolderID(mypid);
			if (appsfolderid != null && appsfolderid.length > 0) {
				let gameexe = await getCachedGameExe(mypid);
				if (gameexe != null && gameexe.length > 0) {
					window.open(`xfxbgapp://${appsfolderid}^${gameexe}`);
					return;
				}
			}
		}
	} catch (e) {
		console.error(`Error: ${e}`);
	}
});