import { urlParams, pid, gname, getActualName } from './common.js';

const xboxsearchButton = document.getElementById('squarexboxsearchbutton');
xboxsearchButton.addEventListener('click', function () {
    window.open('https://www.xbox.com/en-us/Search/Results?q=' + getActualName(gname));
});
