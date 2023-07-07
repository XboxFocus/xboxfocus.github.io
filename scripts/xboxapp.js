import { urlParams, pid, getActualPID } from './common.js';

const xappButton = document.getElementById('xboxappbutton');
xappButton.addEventListener('click', function () {
    window.open('msxbox://game/?productId=' + getActualPID(pid));
});