import { urlParams, pid, getActualPID } from './common.js';

const msstoreButton = document.getElementById('msstorebutton');
msstoreButton.addEventListener('click', function () {
    window.open('ms-windows-store://pdp/?ProductId=' + getActualPID(pid));
});