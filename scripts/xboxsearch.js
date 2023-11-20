import { urlParams, pid, gname, getActualName } from './common.js';

const xboxsearchButton = document.getElementById('xboxsearchbutton');
xboxsearchButton.addEventListener('click', function () {
    window.open('https://www.microsoft.com/it-it/search/shop/games?devicetype=pc&q=' + getActualName(gname));
});
