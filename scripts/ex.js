import { urlParams, pid, getActualPID } from './common.js';

const displaycatalogButton = document.getElementById('displaycatalogbutton');
displaycatalogButton.addEventListener('click', function () {
    window.open('https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=' + getActualPID(pid) + '&market=US&languages=en-us');
});

const datacacheButton = document.getElementById('datacachebutton');
datacacheButton.addEventListener('click', function () {
    window.open('https://github.com/XboxFocus/xboxfocus.github.io/blob/main/data_cache.txt');
});

const sheetButton = document.getElementById('sheetbutton');
sheetButton.addEventListener('click', function () {
    window.open('https://docs.google.com/spreadsheets/d/1pnX3puJVTR3qa7FjUfEYl1F3jH2eMICwxeBpESdzt6I/edit#gid=0');
});

const xpacheckButton = document.getElementById('xpacheckbutton');
xpacheckButton.addEventListener('click', function () {
    window.open('https://github.com/XboxFocus/XPACheck');
});