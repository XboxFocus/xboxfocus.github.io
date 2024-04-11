import {
	urlParams,
	pid,
	getActualPID,
	getCachedGameVerticalImg,
	getCachedGameBackgroundImg
} from './common.js';

class GameData {
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

async function ExtractSheetsData(csvData) {
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
				const classValue = classSubstring.substring(0, classEndIndex);
				cur_class = classValue;
			}
		}

		if (!(rows[i].includes("s22") || rows[i].includes("s23")) && !seen_s22) {
			continue;
		}

		switch (cur_class) {
			default:
				break;
			case 's11':
				if (gd.Name.length > 0 && gd.PID.length > 0) {
					games.push(gd);
					gd = new GameData("", "", "", "", "", "", "", "", "", "", "", "");
				}
				break;
			case 's22':
			case 's23':
				seen_s22 = true;
				if (gd.Name.length > 0 && gd.PID.length > 0) {
					games.push(gd);
					gd = new GameData("", "", "", "", "", "", "", "", "", "", "", "");
				}
				stage = 1;
				continue;
			case 's12':
			case 's1':
				stage = 2;
				break;
			case 's13':
			case 's2':
				stage = 3;
				break;
			case 's14':
			case 's3':
				stage = 4;
				break;
			case 's15':
			case 's4':
				stage = 5;
				break;
			case 's16':
			case 's5':
				stage = 6;
				break;
			case 's17':
			case 's6':
				stage = 7;
				break;
			case 's18':
			case 's7':
				stage = 8;
				break;
			case 's19':
			case 's8':
				stage = 9;
				break;
			case 's20':
			case 's9':
				stage = 10;
				break;
			case 's21':
			case 's10':
				stage = 11;
				break;
		} // Switch (cur_class)

		switch (stage) {
			case 1:
				var pidIndex = rows[i].indexOf('pid=');
				if (pidIndex !== -1) {
					var actualPid = rows[i].substring(pidIndex + 4);
					var gnameIndex = actualPid.indexOf('&gname');
					var pid = (gnameIndex !== -1) ? actualPid.substring(0, gnameIndex) : actualPid;
					if (pid.length > 0) {
						gd.PID = pid.toUpperCase();
					} else {
						break;
					}
				} else {
					break;
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

	document.getElementById("myDropdown").value = "";

	ResetText();
}

function ResetText() {

	const text = document.getElementById('myTextInput');
	text.style.display = "none";
}

async function RefreshList(drawbuttons) {

	const exportURL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQNMfFCzh3cr1wjEgojbLDBqApRz_uUe1Xrn8G7z3gWbpAxqMQl2NuJ9HhAfrVm4pP-voybGg5xSYhX/pubhtml?gid=0&single=true`;
	document.getElementById("entries");
	entries.innerHTML = ""; // Clear all child elements

	// Make an HTTP request
	const xhr = new XMLHttpRequest();
	xhr.open('GET', exportURL, true);
	xhr.onreadystatechange = async () => {
		if (xhr.readyState === 4 && xhr.status === 200) {

			// Process the CSV data (e.g., parse it into an array)
			let csvData = xhr.responseText;

			let games = await ExtractSheetsData(csvData);
			let data = games;

			//console.log("Data size: " + data.length);

			let urlParams = new URLSearchParams(window.location.search);
			let page = urlParams.get('page');
			let dfilt = urlParams.get('filter');
			let dtext = urlParams.get('text');
			const dtext_url_value = dtext == null ? "" : dtext;
			if (page == null) {
				page = "0";
			}
			if (dfilt == null) {
				dfilt = "OAAZ";
			}
			if (dtext == null) {
				dtext = "";
			}

			const dropdown = document.getElementById("myDropdown");
			const textInput = document.getElementById("myTextInput");

			if (dropdown.value.length > 0 && urlParams.get('filter') != null) {
				dfilt = dropdown.value;
			}

			if (textInput.value.length > 0 && urlParams.get('text') != null) {
				dtext = textInput.value;
			}

			switch (dfilt) {
				case 'OAZA':
					data = data.reverse();
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
				default:
					break;
			}

			let max_in_page = 32;
			document.title = "All XPA Games -- Page " + (parseInt(page) + 1);
			for (let i = 0; i < max_in_page; i++) {
				let it = ((parseInt(page)) * max_in_page) + i;
				if (data.length > 0) {
					if (it < data.length) {

						const entryData = data[it];
						//console.log(entryData.Name);

						let mypid = getActualPID(entryData.PID);
						let noid = mypid.length <= 0;

						//console.log("pid: " + mypid);
						let vertical_img = "";

						if (!noid) {
							vertical_img = await getCachedGameVerticalImg(mypid);
						}
						if (vertical_img.length == 0) {
							vertical_img = "unknown.png";
						}

						const entry = document.createElement("div");
						entry.className = "entry";
						entry.onclick = function() {
							window.open("https://xboxfocus.github.io?pid=" + mypid + "&gname=" + entryData.Name);
						};
						const img = document.createElement("img");

						img.src = vertical_img.includes("unknown.png") ? vertical_img : vertical_img + "?q=90&w=177&h=265";
						const name = document.createElement("tid");
						name.textContent = mypid + '\n';
						const titleId = document.createElement("titl");
						titleId.innerHTML = "<b>" + entryData.Name + "<\/b>";
						
						//console.log("XGP: " + entryData.XGP + " for " + entryData.Name);
						switch(entryData.XGP) {
							case 'Yes':
								name.style.border = "2px solid chartreuse";
								break;
							case 'Soon':
								name.style.border = "2px solid gold";
								break;
							default:
								break;
						}
						
						entry.appendChild(img);
						entry.appendChild(name);
						entry.appendChild(titleId);
						entries.appendChild(entry);
					}
				} else {
					const entry = document.createElement("div");
					entry.className = "entry";
					entry.onclick = function() {
						window.location.href = "https://xboxfocus.github.io/allxpa";
					};
					const img = document.createElement("img");
					img.src = "none.png";
					const name = document.createElement("tid");
					name.textContent = "Reset Filters" + '\n';
					const titleId = document.createElement("titl");
					titleId.innerHTML = "<b>Click me<\/b>";
					entry.appendChild(img);
					entry.appendChild(name);
					entry.appendChild(titleId);
					entries.appendChild(entry);
					break;
				}
			}

			const button = document.createElement('button');
			const back_button = document.createElement('button');
			const footer = document.getElementById('footer');
			footer.innerHTML = "";
			const container = document.createElement('div');
			container.style.display = 'wrap';
			container.style.justifyContent = 'space-evenly';
			container.style.alignItems = 'center';
			container.style.textAlign = 'center';
			let has_first_button = (parseInt(page)) > 0;
			let has_second_button = data.length > (max_in_page * ((parseInt(page)) + 1));
			if (has_first_button || has_second_button) {
				const heading = document.createElement('h3');
				heading.textContent = 'Buttons';
				container.appendChild(heading);
				const lineBreak = document.createElement('br');
				container.appendChild(lineBreak);
			}
			if (has_first_button) {
				// TODO:
				// I don't know why, but if the text of the buttons
				// has different length, then the buttons won't
				// be perfectly centered
				back_button.innerHTML = '<-- Page';
				back_button.onclick = function() {
					if (textInput.value.length > 0 || (dropdown.value != "DEV" && dropdown.value != "PUB")) {
						if (dtext_url_value.length > 0 && dtext_url_value == textInput.value) {
							const newUrl = window.location.href.split('?')[0] + '?page=' + ((parseInt(urlParams.get('page')) || 0) - 1) + "&filter=" + (dropdown.value.length > 0 ? dropdown.value : "OAAZ") + "&text=" + textInput.value;
							window.location.href = newUrl;
						} else {
							if ((dropdown.value == "DEV" || dropdown.value == "PUB")) {
								const newUrl = window.location.href.split('?')[0] + '?page=' + ((parseInt(urlParams.get('page')) || 0) - 1);
								window.location.href = newUrl;
							} else {
								const newUrl = window.location.href.split('?')[0] + '?page=' + ((parseInt(urlParams.get('page')) || 0) - 1) + "&filter=" + (dropdown.value.length > 0 ? dropdown.value : "OAAZ");
								window.location.href = newUrl;
							}
						}
					}
				};
				container.appendChild(back_button)
			}
			if (has_second_button) {
				if (has_first_button) {
					for (let k = 0; k < 6; k++) {
						container.appendChild(document.createTextNode('\u00A0'));
					}
				}
				// TODO:
				// I don't know why, but if the text of the buttons
				// has different length, then the buttons won't
				// be perfectly centered
				button.innerHTML = '--> Page';
				button.onclick = function() {
					if (textInput.value.length > 0 || (dropdown.value != "DEV" && dropdown.value != "PUB")) {
						if (dtext_url_value.length > 0 && dtext_url_value == textInput.value) {
							const newUrl = window.location.href.split('?')[0] + '?page=' + ((parseInt(urlParams.get('page')) || 0) + 1) + "&filter=" + (dropdown.value.length > 0 ? dropdown.value : "OAAZ") + "&text=" + textInput.value;
							window.location.href = newUrl;
						} else {
							if ((dropdown.value == "DEV" || dropdown.value == "PUB")) {
								const newUrl = window.location.href.split('?')[0] + '?page=' + ((parseInt(urlParams.get('page')) || 0) + 1);
								window.location.href = newUrl;
							} else {
								const newUrl = window.location.href.split('?')[0] + '?page=' + ((parseInt(urlParams.get('page')) || 0) + 1) + "&filter=" + (dropdown.value.length > 0 ? dropdown.value : "OAAZ");
								window.location.href = newUrl;
							}
						}
					}
				};
				container.appendChild(button);
			}
			footer.appendChild(container);

			document.getElementById('loading-text').style.display = 'none';
		}
	};
	xhr.send();
}

async function handleSelection() {
	const dropdown = document.getElementById("myDropdown");
	const textInput = document.getElementById("myTextInput");
	textInput.removeEventListener("keydown", handleEnterKey);
	textInput.value = ""; // Reset the input value
	switch (dropdown.value) {
		case "DEV":
		case "PUB":
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

document.addEventListener('DOMContentLoaded', async () => {

	ResetFilters();

	const dropdown = document.getElementById("myDropdown");
	const textInput = document.getElementById("myTextInput");
	let urlParams = new URLSearchParams(window.location.search);
	let dfilt = urlParams.get('filter');
	if (dfilt != null && dfilt.length > 0) {
		dropdown.value = dfilt;
	}
	textInput.removeEventListener("keydown", handleEnterKey);
	switch (dropdown.value) {
		case "DEV":
		case "PUB":
			textInput.style.display = "inline-block";
			textInput.addEventListener("keydown", handleEnterKey);
			break;
	}
	let dtext = urlParams.get('text');
	if (dtext != null && dtext.length > 0) {
		textInput.value = dtext;
	}

	await RefreshList();

	document.getElementById("myDropdown").onchange = handleSelection;
});