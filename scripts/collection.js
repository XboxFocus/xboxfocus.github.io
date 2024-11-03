import {
    RefreshList,
    ExtractSheetsData
} from './sheets.js';
import {
    urlParams,
    pid,
    gname,
    getActualPID,
    getActualName,
    getCachedGameVerticalImg,
    getCachedGameBackgroundImg,
    getImageQuality,
    getVerticalImageSize
} from './common.js';

const entries = document.getElementById("entries");
let savedGames = [];
let loadedFileContent = null;
let loadedFileLines = ["List", "false"];
const fileNameDisplay = document.getElementById("fileName");
const loadButton = document.getElementById("loadButton");
const downloadButton = document.getElementById("downloadButton");
const filterCheckbox = document.getElementById("filterCheckbox");
downloadButton.disabled = true;
filterCheckbox.disabled = true;

window.onload = initializePage;

document.getElementById('fileInput').addEventListener('change', handleFileInputChange);

async function initializePage() {
    fileNameDisplay.textContent = '';
    document.getElementById('fileInput').value = '';
	filterCheckbox.checked = false; // Ensure the checkbox is unchecked
}

function handleFileInputChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            loadedFileContent = e.target.result;
            loadedFileLines = loadedFileContent.split('\n').slice(0, 2);
            fileNameDisplay.textContent = `Loaded file: ${file.name}`;
        };
        reader.readAsText(file);
		filterCheckbox.disabled = false;
    }
}

async function fetchSheetsData() {
    const data = await RefreshList(false);
    return data;
}

async function loadCollectionEntries() {
    loadButton.disabled = true;
	filterCheckbox.disabled = true;
    const sheetsData = await fetchSheetsData();
    const dataCache = await fetchDataCache();

    entries.innerHTML = ''; // Clear previous entries

    sheetsData.forEach(entryData => {
        if (!filterCheckbox.checked || (loadedFileContent && loadedFileContent.includes(getActualPID(entryData.PID.trim()).trim()))) {
            createEntry(entryData, dataCache);
        }
    });

    if (loadedFileContent) {
        updateSavedGames();
    }

    setupDownloadButton();
	filterCheckbox.disabled = true; // Disable the checkbox
}

async function fetchDataCache() {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "data_cache.txt");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                resolve(xhr.responseText.split("\n"));
            }
        };
        xhr.send();
    });
}

function createEntry(entryData, dataCache) {
    const pid = getActualPID(entryData.PID.trim()).trim();
    const name = entryData.Name.trim();

    const entryContainer = document.createElement("div");
    entryContainer.className = "entry-container";

    const collectionAdd = createCollectionButton("collection_add.png", "collection_add", pid);
    const collectionRemove = createCollectionButton("collection_remove.png", "collection_remove", pid, true);

    if (loadedFileContent && loadedFileContent.includes(pid)) {
        toggleCollectionButtons(collectionAdd, collectionRemove, true);
        savedGames.push(pid);
    }

    if (!filterCheckbox.checked) {
        collectionAdd.onclick = () => handleCollectionAdd(pid, collectionAdd, collectionRemove);
        collectionRemove.onclick = () => handleCollectionRemove(pid, collectionAdd, collectionRemove);
    }

    const entry = createEntryElement(entryData, pid, name, dataCache);

	if (!filterCheckbox.checked) {
		entryContainer.appendChild(collectionAdd);
		entryContainer.appendChild(collectionRemove);
	}
    entryContainer.appendChild(entry);
    entries.appendChild(entryContainer);
}

function createCollectionButton(src, className, pid, hidden = false) {
    const button = document.createElement("img");
    button.src = src;
    button.className = className;
    button.setAttribute("data-pid", pid);
    if (hidden) button.style.display = "none";
    return button;
}

function handleCollectionAdd(pid, collectionAdd, collectionRemove) {
    if (!savedGames.includes(pid)) {
        savedGames.push(pid);
        toggleCollectionButtons(collectionAdd, collectionRemove, true);
    }
}

function handleCollectionRemove(pid, collectionAdd, collectionRemove) {
    savedGames = savedGames.filter(savedPid => savedPid !== pid);
    toggleCollectionButtons(collectionAdd, collectionRemove, false);
}

function toggleCollectionButtons(addButton, removeButton, isAdded) {
    addButton.style.display = isAdded ? "none" : "block";
    removeButton.style.display = isAdded ? "block" : "none";
}

function createEntryElement(entryData, pid, name, dataCache) {
    const entry = document.createElement("div");
    entry.className = "entry";
    entry.onclick = () => window.open(`https://xboxfocus.github.io?pid=${pid}&gname=${entryData.Name}`);

    const img = document.createElement("img");
    img.src = findImageUrl(pid, name, dataCache);

    const tname = document.createElement("tid");
    tname.textContent = `${pid}\n`;

    const titleId = document.createElement("titl");
    titleId.innerHTML = `<b>${entryData.Name}</b>`;

    entry.appendChild(img);
    entry.appendChild(tname);
    entry.appendChild(titleId);

    return entry;
}

function findImageUrl(pid, name, dataCache) {
    let imageUrl = "unknownsquare.png";
    for (let j = 0; j < dataCache.length; j++) {
        const cacheEntry = dataCache[j].split("|");
        if (cacheEntry.length > 4 && (getActualPID(cacheEntry[1].trim()).trim() === pid || cacheEntry[0].trim() === name) && cacheEntry[4].length > 0) {
            imageUrl = `${cacheEntry[4]}?q=90&w=177&h=177`;
            break;
        }
    }
    return imageUrl;
}

function updateSavedGames() {

    const lines = loadedFileContent.split('\n');
    if (lines.length > 2) {
        savedGames = lines[2].split('|');
        savedGames.forEach(pid => {
            const addBtn = document.querySelector(`.collection_add[data-pid="${pid.trim()}"]`);
            const removeBtn = document.querySelector(`.collection_remove[data-pid="${pid.trim()}"]`);
            if (addBtn && removeBtn) {
                toggleCollectionButtons(addBtn, removeBtn, true);
            }
        });
    }
}

function setupDownloadButton() {
    downloadButton.style.display = "inline-block";
    downloadButton.disabled = false;
    downloadButton.onclick = downloadFile;
}

function downloadFile() {
    if (savedGames.length === 0) {
        return;
    }

    const allPIDs = savedGames.map(pid => pid.trim()).join('|').replace(/[\r\n]+/g, '').replace("\\n", "\n").replace("\n", "");
    const content = `${loadedFileLines[0]}\n${loadedFileLines[1]}\n${allPIDs}`;
    const blob = new Blob([content], {
        type: 'text/plain;charset=utf-8'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'list.xfdata';
    link.click();
}

window.loadCollectionEntries = loadCollectionEntries;

filterCheckbox.addEventListener('change', loadCollectionEntries);