import { urlParams, pid, gname, getActualName } from './common.js';

const xboxsearchButton = document.getElementById('xboxsearchbutton');
xboxsearchButton.addEventListener('click', function () {
    window.open('https://www.xbox.com/it-IT/search/results/games?q=' + getActualName(gname) + '&PlayWith=PC');
});