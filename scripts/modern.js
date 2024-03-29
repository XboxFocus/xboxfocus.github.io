import {
    urlParams,
    pid,
    getActualPID,
    getCachedGameVerticalImg,
    getCachedGameBackgroundImg
} from './common.js';

document.addEventListener('DOMContentLoaded', async () => {

	// Get the image element by its id
    const imageElement = document.getElementById("vertical");
    let mypid = getActualPID(pid);
	let noid = mypid.length <= 0;
	
	console.log("pid: " + mypid);
    let vertical_img = "";
	
	if(!noid) {
		vertical_img = await getCachedGameVerticalImg(mypid);
	}
    if (vertical_img.length == 0) {
        vertical_img = "unknown.png";
    }

    imageElement.src = vertical_img;

    // Get a reference to the background container
    const backgroundContainer = document.getElementById('background-container');

    let horizontal_img = await getCachedGameBackgroundImg(mypid);
	if (horizontal_img.length == 0) {
		horizontal_img = "white.png";
	}
	let imageUrl = horizontal_img;
	backgroundContainer.style.width = "100%";
	backgroundContainer.style.height = "100%";
    backgroundContainer.style.backgroundImage = `url('${imageUrl}')`;

    // Add the custom-opacity class to the background container
    backgroundContainer.classList.add('custom-opacity');
});