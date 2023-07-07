import { urlParams, pid, gname, getActualName } from './common.js';

const xboxbrowserButton = document.getElementById('xboxbrowserbutton');
xboxbrowserButton.addEventListener('click', function () {
    window.open('https://www.xbox.com/it-it/games/store/' + getActualName(gname) + '/' + pid);
});