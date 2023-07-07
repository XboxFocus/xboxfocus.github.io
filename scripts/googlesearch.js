import { gname, getActualName, getSearchableName } from './common.js';

const googlesearchButton = document.getElementById('googlesearchbutton');
googlesearchButton.addEventListener('click', function () {
    let myurl = 'https://www.google.com/search?q=Xbox+' + getSearchableName(gname);
    console.log(myurl);
    window.open(myurl);
});