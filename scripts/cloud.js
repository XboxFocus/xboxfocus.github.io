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
import { GameData, ExtractSheetsData } from './sheets.js';

	let sheets_data = [];
			
			function AddSquare(game_data, type, data) {
				console.log("Adding: " + type);
				
				let imageUrl = "";
				let below_text = "";
				
				var cont = document.getElementById("square-container");
				var square = document.createElement('div');
				square.style.cursor = 'pointer';
				var textNode = document.createElement('h3');
				var myhr = document.createElement('hr');
				
				let ggname = getActualName(game_data.Name).replaceAll(" ", "-");
				let gpid = getActualPID(game_data.PID);
				
				switch(type) {
					case 0:
						square.onclick = function() {
							let url = "https://www.xbox.com/it-IT/play/games/" + ggname + "/" + gpid;
							console.log(url);
							window.open(url);
						};
						imageUrl = "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE2PlDL";
						below_text = "Play with Game Pass Ultimate.\nRequires an active subscription to the service.";
						if(game_data.Cloud.toLowerCase() == "touch") {
							below_text = below_text + "\nTouch controls available.";
						}
						break;
					case 1:
						square.onclick = function() {
							let url = data;
							console.log(url);
							window.open(url);
						};
						imageUrl = "https://blogs.nvidia.com/wp-content/uploads/2021/02/GFN-200x200.png";
						below_text = "Play with GeForce NOW.\nRequires ownership of the game, or a subscription to Game Pass (PC or Ultimate) if it is included in the service.\nYou must link your Xbox account (to your NVIDIA GeForce Now account) beforehand.";
						break;
				}

				square.className = 'cl-square';
				square.style.backgroundImage = `url('${imageUrl}')`;
				  
				// Create the text paragraph
				textNode.className = 'outline-text';
				
				textNode.innerText = below_text;
				
				if (cont.children.length > 0) {
					cont.appendChild(myhr);
				}
				cont.appendChild(square);
				cont.appendChild(textNode);
			}

			function fetchData(url) {
    return new Promise((resolve, reject) => {
        const mxhr = new XMLHttpRequest();
        mxhr.open('GET', url, true);
        mxhr.onreadystatechange = async () => {
            if (mxhr.readyState === 4) {
                if (mxhr.status === 200) {
                    const csvData = mxhr.responseText;
                    sheets_data = await ExtractSheetsData(csvData);
                    console.log("sheets_data set");
                    resolve(sheets_data);
                } else {
                    reject(new Error('Request failed'));
                }
            }
        };
        mxhr.send();
    });
}

document.addEventListener('DOMContentLoaded', async () => {

	const exportURL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQNMfFCzh3cr1wjEgojbLDBqApRz_uUe1Xrn8G7z3gWbpAxqMQl2NuJ9HhAfrVm4pP-voybGg5xSYhX/pubhtml?gid=0&single=true`;

	await fetchData(exportURL);
	
	const xhr = new XMLHttpRequest();
	let fn = "cloud_cache.txt";
	let has_pid = false;
	console.log("URL pid: " + pid);
	let actual_pid = getActualPID(pid);
	console.log("Actual PID: " + actual_pid);
	let game_data = new GameData("", "", "", "", "", "", "", "", "", "", "", "");
	console.log("Reading: " + fn);
	xhr.open("GET", fn);
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			
			let any_services = false;
			
			let is_xgp_cloud = false;
			console.log("Sheets_data length: " + sheets_data.length);
			//console.log(sheets_data);
			for (let i = 0; i < sheets_data.length; i++) {
				let it = i;
				let gpid = getActualPID(sheets_data[it].PID);
				//console.log("GPid: " + gpid);
				if (gpid == actual_pid) {
					game_data = sheets_data[it];
					is_xgp_cloud = sheets_data[it].XGP.toLowerCase() == "yes";
					is_xgp_cloud &= (sheets_data[it].Cloud.toLowerCase() == "yes" || sheets_data[it].Cloud.toLowerCase() == "touch");
					break;
				}
			}

			if(is_xgp_cloud) {
				any_services = true;
				AddSquare(game_data, 0, "");
			}
			
			let data = xhr.responseText.split("\n");
			for (let i = 0; i < data.length; i++) {
				let it = i;
				let entry_data = data[it].toString().split("|");
				//console.log("Find: " + entry_data);
				let fpid = getActualPID(entry_data[1]);
				//console.log("FPid: " + fpid);
				if(fpid == actual_pid) {
					console.log(entry_data.length + " services found.");
					if(entry_data.length > 2) {
						any_services = true;
						
						if(entry_data.length > 2 && entry_data[2].length > 0) {
							AddSquare(game_data, 1, entry_data[2]);
						}
					}
				}
			}
			
			if(!any_services) {
				console.log("Not any services");
				var cont = document.getElementById("square-container");
				var textNode = document.createElement('h3');
				textNode.className = 'outline-text';
				name = gname;
				if (game_data.Name.length > 0) {
					name = game_data.Name;
				}
				textNode.textContent = name + " is currently not available on any cloud service.";
				cont.appendChild(textNode);
			}
		}
	};
	xhr.send();
	
	// Get the image element by its id
	const imageElement = document.getElementById("vertical");
	let mypid = getActualPID(pid);
	let noid = mypid.length <= 0;

	console.log("pid: " + mypid);
	let vertical_img = "";
	let horizontal_img = "";

	if (!noid) {
		vertical_img = await getCachedGameVerticalImg(mypid);
		if (vertical_img != null && vertical_img.length > 0) {
			horizontal_img = await getCachedGameBackgroundImg(mypid);
		}
	}

	if (vertical_img.length == 0) {
		vertical_img = "unknown.png";
		horizontal_img = "white.png";
	} else {
		vertical_img = vertical_img + "?q=" + getImageQuality() + "&" + getVerticalImageSize();
	}

	imageElement.src = vertical_img;
	//console.log("Vertical: " + vertical_img);

	// Get a reference to the background container
	const backgroundContainer = document.getElementById('background-container');

	let imageUrl = horizontal_img + "?q=" + getImageQuality();
	//console.log("Horizontal: " + imageUrl);
	backgroundContainer.style.width = "100%";
	backgroundContainer.style.height = "100%";
	backgroundContainer.style.backgroundImage = `url('${imageUrl}')`;

	// Add the custom-opacity class to the background container
	backgroundContainer.classList.add('custom-opacity');
});

