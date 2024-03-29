import { urlParams, pid, getActualPID, getCachedAppsFolderID, getCachedGameExe } from './common.js';

const launchButton = document.getElementById('launchbutton');
launchButton.addEventListener('click', async () => {
    try {
        let mypid = getActualPID(pid);
        if (mypid.length > 0) {
            let appsfolderid = await getCachedAppsFolderID(mypid);
            let gameexe = await getCachedGameExe(mypid);
            if (appsfolderid.length > 0 && gameexe.length > 0) {
                window.open(`xfxbgapp://${appsfolderid}^${gameexe}`);
                return;
            }
        }
    } catch (e) {
        console.error(`Error: ${e}`);
    }
});