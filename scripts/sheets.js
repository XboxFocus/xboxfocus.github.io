import {
    urlParams,
    pid,
    getActualPID,
    getCachedGameVerticalImg,
    getCachedGameBackgroundImg,
    getCachedAppsFolderID,
    getCachedGameExe,
    getImageQuality,
    getVerticalImageSize
} from './common.js';

var image_cache = new Map();
const allow_bg = false;
const max_in_page = 32;

export class GameData {
    constructor(name, pid, dev, pub, date, pc, gen, exc, cloud, feat, xgp, comment) {
        this.Name = name;
        this.PID = pid;
        this.Developer = dev;
        this.Publisher = pub;
        this.Date = date;
        this.PCApp = pc;
        this.Generation = gen;
        this.Exclusive = exc;
        this.Cloud = cloud;
        this.Features = feat;
        this.XGP = xgp;
        this.Comments = comment;
    }
}

// Unused but it should be easy to add a button
async function DownloadArray(arr) {

    const jsonblob = JSON.stringify(arr);
    const blob = new Blob([jsonblob], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    let a = document.getElementById("a");
    if (!a) {
        a = document.createElement('a');
    }
    a.href = url;
    a.download = 'myArray.json';
    a.click();
    return jsonblob;
}

export async function ExtractSheetsData(csvData) {

    let rows = csvData.split('\n'); // Split by newline
    let my_id = -1;
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].includes("<script ")) {
            my_id = i;
        }
    }

    if (my_id == -1) {
        return;
    }

    rows = rows[my_id].split('<');

    let mergedLines = [];
    for (let i = 0; i < rows.length; ++i) {
        if (rows[i].startsWith("div") || (rows[i].startsWith("a target") && !rows[i].includes("xboxfocus"))) {
            // Merge with the previous line
            if (mergedLines.length > 0) {
                mergedLines[mergedLines.length - 1] += rows[i];
            }
        } else {
            // Add non-"div" lines directly to mergedLines
            mergedLines.push(rows[i]);
        }
    }
    rows = mergedLines;

    let games = [];
    let seen_s22 = false;
    let stage = 0;
    let gd = new GameData("", "", "", "", "", "", "", "", "", "", "", "");

    for (let i = 0; i < rows.length; i++) {
        rows[i] = rows[i].replace("%3D", "=").replace("%20", " ").replace("%26", "&").replace("%2F", "/");
        rows[i] = rows[i].replace("&amp;", "&").replace("&nbsp;", " ").replace("&gt;", ">").replace("&#39;", "\'");

        let cur_class = "123456789";
        const classStartIndex = rows[i].indexOf('class="');
        if (classStartIndex !== -1) {
            const classSubstring = rows[i].substring(classStartIndex + 7);
            const classEndIndex = classSubstring.indexOf('"');
            if (classEndIndex !== -1) {
                const classValue = classSubstring.substring(0, classEndIndex).replace("softmerge-inner", "").replace("softmerge", "").replace(" ", "");
                cur_class = classValue;
            }
        }

        if (!(rows[i].includes("s22") || rows[i].includes("s23") || rows[i].includes("s26")) && !seen_s22) {
            continue;
        }

        switch (cur_class) {
            default:
                break;
            case 0:
                break;
            case '123456789':
                break;
            case 's11':
                if (gd.Name.length > 0 && gd.PID.length > 0) {
                    games.push(gd);
                    gd = new GameData("", "", "", "", "", "", "", "", "", "", "", "");
                }
                break;
            case 's22':
            case 's23':
            case 's26':
                seen_s22 = true;
                if (gd.Name.length > 0 && gd.PID.length > 0) {
                    games.push(gd);
                    gd = new GameData("", "", "", "", "", "", "", "", "", "", "", "");
                }
                stage = 1;
                continue;
            case 's1':
            case 's12':
            case 's27':
            case 's41':
                stage = 2;
                break;
            case 's2':
            case 's13':
            case 's33':
            case 's38':
                stage = 3;
                break;
            case 's3':
            case 's14':
            case 's34':
                stage = 4;
                break;
            case 's4':
            case 's15':
                stage = 5;
                break;
            case 's5':
            case 's16':
            case 's39':
                stage = 6;
                break;
            case 's17':
            case 's6':
            case 's28':
            case 's40':
                stage = 7;
                break;
            case 's18':
            case 's7':
            case 's29':
                stage = 8;
                break;
            case 's8':
            case 's19':
            case 's30':
                stage = 9;
                break;
            case 's20':
            case 's24':
            case 's31':
            case 's35':
            case 's36':
                stage = 10;
                break;
            case 's21':
            case 's25':
            case 's32':
            case 's37':
                stage = 11;
                break;
        } // Switch (cur_class)

        switch (stage) {
            case 1: {
                const pidIndex = rows[i].indexOf('pid=');
                if (pidIndex !== -1) {
                    const actualPid = rows[i].substring(pidIndex + 4);
                    const gnameIndex = actualPid.indexOf('&gname');
                    const pid = (gnameIndex !== -1) ? actualPid.substring(0, gnameIndex) : actualPid;
                    if (pid.length > 0) {
                        gd.PID = pid.toUpperCase();
                    } else {
                        //break;
                    }
                } else {
                    break;
                }
            }
            gd.Name = rows[i].includes(">") ? rows[i].substring(rows[i].lastIndexOf(">") + 1) : rows[i];
            break;
            case 2:
                gd.Developer = rows[i].includes(">") ? rows[i].substring(rows[i].lastIndexOf(">") + 1) : rows[i];
                break;
            case 3:
                gd.Publisher = rows[i].includes(">") ? rows[i].substring(rows[i].lastIndexOf(">") + 1) : rows[i];
                break;
            case 4:
                gd.Date = rows[i].includes(">") ? rows[i].substring(rows[i].lastIndexOf(">") + 1) : rows[i];
                break;
            case 5:
                gd.PCApp = rows[i].includes(">") ? rows[i].substring(rows[i].lastIndexOf(">") + 1) : rows[i];
                break;
            case 6:
                gd.Generation = rows[i].includes(">") ? rows[i].substring(rows[i].lastIndexOf(">") + 1) : rows[i];
                break;
            case 7:
                gd.Exclusive = rows[i].includes(">") ? rows[i].substring(rows[i].lastIndexOf(">") + 1) : rows[i];
                break;
            case 8:
                gd.Cloud = rows[i].includes(">") ? rows[i].substring(rows[i].lastIndexOf(">") + 1) : rows[i];
                break;
            case 9:
                gd.Features = rows[i].includes(">") ? rows[i].substring(rows[i].lastIndexOf(">") + 1) : rows[i];
                break;
            case 10:
                gd.XGP = rows[i].includes(">") ? rows[i].substring(rows[i].lastIndexOf(">") + 1) : rows[i];
                break;
            case 11:
                gd.Comments = rows[i].includes(">") ? rows[i].substring(rows[i].lastIndexOf(">") + 1) : rows[i];
                break;
            default:
                break;
        } // Switch(stage)

        stage = 0;
    } // For

    if (gd.Name.length > 0 && gd.PID.length > 0) {
        games.push(gd);
    }

    return games;
}

function ResetFilters() {

    let dd = document.getElementById("myDropdown");
    if (dd != null) {
        dd.value = "";
    }

    ResetText();
}

function ResetText() {

    const mtext = document.getElementById('myTextInput');
    if (mtext != null) {
        mtext.style.display = "none";
    }
}

function removeNonAlphanumeric(inputString) {

    return inputString.replace(/[^a-zA-Z0-9]/g, '');
}

function containsOnlyDigits(inputString) {

    return /^[0-9]+$/.test(inputString);
}

function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function RefreshList(drawbuttons) {
    const exportURL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQNMfFCzh3cr1wjEgojbLDBqApRz_uUe1Xrn8G7z3gWbpAxqMQl2NuJ9HhAfrVm4pP-voybGg5xSYhX/pubhtml?gid=0&single=true`;
    document.getElementById("entries").innerHTML = ""; // Clear all child elements

    const data = await fetchData(exportURL);
    return data;
}

export async function fetchData(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = async () => { // Make this function async
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const csvData = xhr.responseText;
                    try {
                        const sheetsData = await ExtractSheetsData(csvData); // Process CSV data here
                        resolve(sheetsData);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error('Failed to fetch data'));
                }
            }
        };
        xhr.send();
    });
}

async function applyFilters(data, dfilt, dtext) {
    // Apply filters based on dfilt and dtext
    switch (dfilt) {
        case 'OAAZ':
            break;
        case 'OAZA':
            data = data.reverse();
            break;
        case 'NAM':
            if (dtext.trim().length > 0) {
                data = data.filter(item => item.Name.toLowerCase().includes(dtext.toLowerCase()));
            }
            break;
        case 'DEV':
            if (dtext.trim().length > 0) {
                data = data.filter(item => item.Developer.toLowerCase().includes(dtext.toLowerCase()));
            }
            break;
        case 'PUB':
            if (dtext.trim().length > 0) {
                data = data.filter(item => item.Publisher.toLowerCase().includes(dtext.toLowerCase()));
            }
            break;
        case 'XGP':
            data = data.filter(item => item.XGP.toLowerCase() == "yes" || item.XGP.toLowerCase() == "soon");
            break;
        case 'CGP':
            data = data.filter(item => item.XGP.toLowerCase() == "soon");
            break;
        case 'NoGP':
            data = data.filter(item => item.XGP.toLowerCase() != "yes" && item.XGP.toLowerCase() != "soon");
            break;
        case 'YPA':
            data = data.filter(item => item.PCApp.toLowerCase() == "yes");
            break;
        case 'NPA':
            data = data.filter(item => item.PCApp.toLowerCase() == "no");
            break;
        case 'XOne':
            data = data.filter(item => item.Generation.toLowerCase() == "one");
            break;
        case 'OXOX':
            data = data.filter(item => item.Features.toLowerCase().includes("x1x"));
            break;
        case 'OXSX':
            data = data.filter(item => item.Features.toLowerCase().includes("xsx"));
            break;
        case 'XSX':
            data = data.filter(item => item.Generation.toLowerCase() == "x|s");
            break;
        case 'TY':
            const currentYear = new Date().getFullYear();
            data = data.filter(item => item.Date.includes(currentYear));
            break;
        case 'LIY':
			const cYear = new Date().getFullYear();
			data = data.filter(item => item.Date.includes(cYear));
			data = data.filter(item => {

                if (item.Date.split("/").length == 3) {
                    const [day, month, year] = item.Date.split("/");
                    const jsDate = new Date(year, month - 1, day);
                    const today = new Date(); // Get today's date

                    // Compare the item's date with today
                    return jsDate >= today;
                } else {
                    if (item.Date.split("/").length == 0) {
                        if (item.Date == cYear) {
                            return true;
                        }
                    }
                }
                return false;
            });
            break;
        case 'EXC':
            data = data.filter(item => item.Exclusive.toLowerCase() == "yes");
            break;
        case '4K':
            data = data.filter(item => item.Features.toLowerCase().includes("4k"));
            break;
        case 'SPI':
            data = data.sort((a, b) => removeNonAlphanumeric(a.PID.trim().normalize().toLowerCase()).localeCompare(removeNonAlphanumeric(b.PID.trim().normalize().toLowerCase())));
            break;
        case 'SD':
            data = data.sort((a, b) => removeNonAlphanumeric(a.Developer.trim().normalize().toLowerCase()).localeCompare(removeNonAlphanumeric(b.Developer.trim().normalize().toLowerCase())));
            break;
        case 'SPU':
            data = data.sort((a, b) => removeNonAlphanumeric(a.Publisher.trim().normalize().toLowerCase()).localeCompare(removeNonAlphanumeric(b.Publisher.trim().normalize().toLowerCase())));
            break;
        case 'SRD': {
            const filteredData = [];

            for (const item of data) {
                if (item.Date == null || item.Date.length <= 1 || item.Date.toLowerCase().includes("unannounced") || item.Date.toLowerCase().includes("unclear") || item.Date.toLowerCase().includes("unknown")) {
                    continue;
                }
                item.Date = item.Date.replace("Q1", "").replace("Q2", "").replace("Q3", "").replace("Q4", "").trim();
                let it_split = item.Date.split("/");
                if (it_split.length != 3) {
                    if (item.Date.includes("/")) {
                        continue;
                    }
                    if (it_split.length != 1) {
                        continue;
                    }
                }

                if (it_split.length == 1) {
                    const only_numbers = containsOnlyDigits(item.Date);
                    if (!only_numbers || item.Date.length != 4) {
                        continue;
                    }
                    item.Date = "31/12/" + item.Date;
                }

                filteredData.push(item);
            }

            data = filteredData.sort((a, b) => {
                const [aday, amonth, ayear] = a.Date.split("/");
                const ajsDate = new Date(ayear, amonth - 1, aday);

                const [bday, bmonth, byear] = b.Date.split("/");
                const bjsDate = new Date(byear, bmonth - 1, bday);

                return ajsDate - bjsDate;
            });
        }
        break;
        case 'XBA': {
            const filteredData = [];

            for (const item of data) {
                if (item.PID === null) {
                    continue;
                }

                const mypid = getActualPID(item.PID);
                if (mypid === null || mypid.length === 0) {
                    continue;
                }

                const appsfolderid = await getCachedAppsFolderID(mypid);
                if (appsfolderid == null || appsfolderid.trim().length == 0) {
                    continue;
                }

                const gameexe = await getCachedGameExe(mypid);

                if (gameexe == null || gameexe.trim().length == 0) {
                    continue;
                }

                filteredData.push(item);
            }

            data = filteredData;
        }
        break;
        case 'NBA': {
            const filteredData = [];

            for (const item of data) {
                if (item.PID === null) {
                    continue;
                }

                const mypid = getActualPID(item.PID);
                if (mypid === null || mypid.length === 0) {
                    continue;
                }

                const appsfolderid = await getCachedAppsFolderID(mypid);
                if (appsfolderid.length > 0) {
                    continue;
                }

                const gameexe = await getCachedGameExe(mypid);

                if (gameexe.length > 0) {
                    continue;
                }

                filteredData.push(item);
            }

            data = filteredData;
        }
        break;
        case 'VIM': {
            const filteredData = [];

            for (const item of data) {
                if (item.PID === null) {
                    continue;
                }

                const mypid = getActualPID(item.PID);
                if (mypid === null || mypid.length === 0) {
                    continue;
                }

                let vertical_img = await getCachedGameVerticalImg(mypid);
                if (vertical_img.length == 0) {
                    continue;
                }

                filteredData.push(item);
            }

            data = filteredData;
        }
        break;
        case 'NVI': {
            const filteredData = [];

            for (const item of data) {
                if (item.PID === null) {
                    continue;
                }

                const mypid = getActualPID(item.PID);
                if (mypid === null || mypid.length === 0) {
                    continue;
                }

                let vertical_img = await getCachedGameVerticalImg(mypid);
                if (vertical_img.length != 0) {
                    continue;
                }

                filteredData.push(item);
            }

            data = filteredData;
        }
        break;
        default:
            break;
    }
    return data;
}

async function displayEntries(data, mid_data_length, page_parsed, next_page, dfilt, dtext) {
    const entries = document.getElementById("entries");
    let used_titleids = [];

    for (let i = 0; i < max_in_page; i++) {
        if (i >= data.length) break;
        const entryData = data[i];
        const entry = await createEntry(entryData);

        if (entry) {
            entries.appendChild(entry);
            const mypid = getActualPID(entryData.PID);
            used_titleids.push(mypid);
        } else {
            const resetEntry = document.createElement("div");
            resetEntry.className = "entry";
            resetEntry.onclick = function() {
                window.location.href = "/allxpa";
            };
            const img = document.createElement("img");
            img.src = "none.png";
            const name = document.createElement("tid");
            name.textContent = "Reset Filters" + '\n';
            const titleId = document.createElement("titl");
            titleId.innerHTML = "<b>Click me</b>";
            resetEntry.appendChild(img);
            resetEntry.appendChild(name);
            resetEntry.appendChild(titleId);
            entries.appendChild(resetEntry);
            break;
        }
    }

    if (allow_bg) {
        let tocache = [];
        for (let pid of used_titleids) {
            if (!pid) continue;
            let horizontal = await getCachedGameBackgroundImg(pid);
            if (horizontal) {
                horizontal += "?q=" + getImageQuality();
                tocache.push(horizontal);
            }
        }

        BrowserCache(tocache);
    }

    createPaginationButtons(mid_data_length, page_parsed, next_page, dfilt, dtext);

    document.getElementById('loading-text').style.display = 'none';
}

async function createEntry(entryData) {
    const mypid = getActualPID(entryData.PID);

    if (mypid == null) {
        return null;
    }

    const noid = mypid.length <= 0;
    let vertical_img = "";
    let appsfolderid = "";
    let gameexe = "";

    if (!noid) {
        vertical_img = await getCachedGameVerticalImg(mypid);
        if (vertical_img != null && vertical_img.length > 0) {
            appsfolderid = await getCachedAppsFolderID(mypid);
            if (appsfolderid != null && appsfolderid.length > 0) {
                gameexe = await getCachedGameExe(mypid);
            }
        }
    }
    if (vertical_img.length == 0) {
        vertical_img = "unknown.png";
    }

    let tempHTML = "";
    if (appsfolderid == null || gameexe == null || appsfolderid.trim().length == 0 || gameexe.trim().length == 0) {
        tempHTML = "<i>" + entryData.Name + "</i>";
    } else {
        tempHTML = "<b>" + entryData.Name + "</b>";
    }

    const entry = document.createElement("div");
    entry.className = "entry";
    entry.onclick = function() {
        window.open("/?pid=" + mypid + "&gname=" + entryData.Name.replace("&", "°").replace("'", "_").replace("+", "ç"));
    };
    const img = document.createElement("img");

    img.src = vertical_img.includes("unknown.png") ? vertical_img : vertical_img + "?q=" + getImageQuality() + "&" + getVerticalImageSize();
    const name = document.createElement("tid");
    name.textContent = mypid + '\n';

    const titleId = document.createElement("titl");
    titleId.innerHTML = tempHTML;

    switch (entryData.XGP) {
        case 'Yes':
            name.style.border = "2px solid chartreuse";
            break;
        case 'Soon':
            name.style.border = "2px solid gold";
            break;
        default:
            break;
    }

    img.onmouseover = EntryOnMouseHover;
    img.onmouseout = EntryOnMouseOut;

    entry.appendChild(img);
    entry.appendChild(name);
    entry.appendChild(titleId);

    await sleep(12);

    return entry;
}

async function cacheBackgroundImages(used_titleids) {
    let tocache = [];
    for (let pid of used_titleids) {
        if (!pid) continue;
        let horizontal = await getCachedGameBackgroundImg(pid);
        if (horizontal) {
            horizontal += "?q=" + getImageQuality();
            tocache.push(horizontal);
        }
    }
    BrowserCache(tocache);
}

async function createPaginationButtons(mid_data_length, page_parsed, next_page, dfilt, dtext) {
    const footer = document.getElementById('footer');
    footer.innerHTML = "";
    const container = document.createElement('div');
    container.style.display = 'wrap';
    container.style.justifyContent = 'space-evenly';
    container.style.alignItems = 'center';
    container.style.textAlign = 'center';

    const has_first_button = page_parsed > 0;
    const has_second_button = mid_data_length > (max_in_page * next_page);

    if (has_first_button || has_second_button) {
        const heading = document.createElement('h3');
        heading.textContent = 'Buttons';
        container.appendChild(heading);
        container.appendChild(document.createElement('br'));
    }

    if (has_first_button) {
        const back_button = document.createElement('button');
        back_button.innerHTML = '<-- Page';
        back_button.onclick = () => {
            navigateToPage(page_parsed - 1, dfilt, dtext);
        };
        container.appendChild(back_button);
    }

    if (has_second_button) {
        const button = document.createElement('button');
        button.innerHTML = '--> Page';
        button.onclick = () => {
            navigateToPage(page_parsed + 1, dfilt, dtext);
        };
        container.appendChild(button);
    }

    footer.appendChild(container);
}

function navigateToPage(page, dfilt, dtext) {
    const newUrl = window.location.href.split('?')[0] + `?page=${page}&filter=${dfilt}&text=${dtext}`;
    window.location.href = newUrl;
}

async function BrowserCacheImage(url) {

    if (!url || url.length === 0) {
        return;
    }

    if (image_cache.has(url)) {
        return;
    }

    const img = new Image();
    img.src = url;
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
    });

    if (image_cache.size >= max_in_page) {
        const firstKey = image_cache.keys().next().value;
        image_cache.delete(firstKey);
    }

    image_cache.set(url, img);
}

async function BrowserCache(urls) {

    for (let i = 0; i < urls.length; i++) {
        await BrowserCacheImage(urls[i]);
    }
}

async function handleSelection() {

    const dropdown = document.getElementById("myDropdown");
    const textInput = document.getElementById("myTextInput");
    textInput.removeEventListener("keydown", handleEnterKey);
    textInput.value = ""; // Reset the input value
    switch (dropdown.value) {
        case "DEV":
        case "PUB":
        case "NAM":
            textInput.style.display = "inline-block";
            textInput.addEventListener("keydown", handleEnterKey);
            break;
        default:
            textInput.style.display = "none";
            const newUrl = window.location.href.split('?')[0] + "?page=0&filter=" + (dropdown.value.length > 0 ? dropdown.value : "OAAZ");
            window.location.href = newUrl;
            break;
    }
}

function handleEnterKey(event) {

    if (event.key === "Enter" && event.target.value.trim().length > 0) {
        // Perform your desired action here
        const dropdown = document.getElementById("myDropdown");
        const newUrl = window.location.href.split('?')[0] + "?page=0&filter=" + (dropdown.value.length > 0 ? dropdown.value : "OAAZ") + "&text=" + event.target.value;
        window.location.href = newUrl;
    }
}

async function EntryOnMouseHover(event) {

    let entry = event.target;

    if (entry == null) {
        return;
    }

    switch (entry.tagName.toLowerCase()) {
        case 'tid':
        case 'titl':
        case 'img':
            entry = entry.parentElement;
            break;
        default:
            break;
    }

    if (entry == null) {
        return;
    }

    let mypid = "";

    for (const child of entry.children) {
        // Check if the child element has the tag name 'tid'
        if (child.tagName.toLowerCase() === 'tid') {
            // Found a 'titleId' element
            mypid = child.textContent.replace("</b>", "").replace("<b>", "").replace("\n", "");
            break;
        }
    }

    if (mypid.length == 0) {
        return;
    }

    mypid = getActualPID(mypid);
    const noid = mypid.length <= 0;

    if (noid) {
        return;
    }

    let horizontal_img = await getCachedGameBackgroundImg(mypid);
    if (horizontal_img.length == 0) {
        horizontal_img = "white.png";
    } else {
        horizontal_img = horizontal_img + "?q=" + getImageQuality();
    }
    const imageUrl = horizontal_img;

    if (allow_bg) {
        // Get a reference to the background container
        const backgroundContainer = document.getElementById('background-container');
        backgroundContainer.style.backgroundImage = `url('${imageUrl}')`;
    } else {
        if (!horizontal_img.includes("white.png")) {
            BrowserCacheImage(horizontal_img);
        }
    }
}

async function EntryOnMouseOut(event) {

    if (!allow_bg) {
        return;
    }

    // Get a reference to the background container
    const backgroundContainer = document.getElementById('background-container');
    const imageUrl = "white.png";
    backgroundContainer.style.backgroundImage = `url('${imageUrl}')`;
}

async function processData(data) {
    const urlParams = new URLSearchParams(window.location.search);
    let page = urlParams.get('page') || "0";
    let dfilt = urlParams.get('filter') || "OAAZ";
    let dtext = urlParams.get('text') || "";

    const page_parsed = parseInt(page);
    const next_page = page_parsed + 1;
    const base_no = page_parsed * max_in_page;

    data = await applyFilters(data, dfilt, dtext);
    const mid_data_length = data.length;

    if (page_parsed > 0) {
        data = data.slice(base_no);
    }

    document.title = "All XPA Games -- Page " + next_page;
    await displayEntries(data, mid_data_length, page_parsed, next_page, dfilt, dtext);
}

document.addEventListener('DOMContentLoaded', async () => {

    ResetFilters();

    const dropdown = document.getElementById("myDropdown");
    const textInput = document.getElementById("myTextInput");
    if (dropdown == null) {
        return;
    }
    if (textInput == null) {
        return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    let dfilt = urlParams.get('filter');
    if (dfilt != null && dfilt.length > 0) {
        dropdown.value = dfilt;
    }
    textInput.removeEventListener("keydown", handleEnterKey);
    switch (dropdown.value) {
        case "DEV":
        case "PUB":
        case "NAM":
            textInput.style.display = "inline-block";
            textInput.addEventListener("keydown", handleEnterKey);
            break;
    }
    let dtext = urlParams.get('text');
    if (dtext != null && dtext.length > 0) {
        textInput.value = dtext;
    }

    // Get a reference to the background container
    const backgroundContainer = document.getElementById('background-container');

    const imageUrl = "white.png";
    backgroundContainer.style.width = "100%";
    backgroundContainer.style.height = "100%";
    backgroundContainer.style.backgroundImage = `url('${imageUrl}')`;

    // Add the custom-opacity class to the background container
    backgroundContainer.classList.add('custom-opacity');

    var gdata = await RefreshList();
    await processData(gdata);

    document.getElementById("myDropdown").onchange = handleSelection;
});