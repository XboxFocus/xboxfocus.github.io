export const urlParams = new URLSearchParams(window.location.search);
export const pid = urlParams.get('pid')?.replace("/\n/g", "")?.trim();
export const gname = urlParams.get('gname')?.replace("/\n/g", "")?.trim();

export let cached_data = []

export function getActualName(my_name) {

	let ret = my_name.replace("_", "'");
	return ret;
}

export function removeAfterSlash(str) {

	const index = str.indexOf('/');
	if (index !== -1) {
		return str.substring(0, index);
	}
	return str;
}

export function getActualPID(my_pid) {

	if (my_pid == null) {
		return "";
	}
	return removeAfterSlash(my_pid);
}

export function getSearchableName(my_name) {

	let ret = my_name.replace(" ", "+")
	return ret;
}

export function getCacheDataFilename() {

	return "data_cache.txt";
}

export async function getCachedData(pid) {

	if (cached_data.length == 0) {

		// Read the file content

		const cache_filename = getCacheDataFilename();
		const response = await fetch(cache_filename);

		if (!response.ok) {
			console.error(`Error fetching file: ${response.status} ${response.statusText}`);
			return "";
		}

		const fileContent = await response.text();

		// Split lines

		const lines = fileContent.split('\n');

		cached_data = lines;
	}

	// Retrieve the PID

	const pid_trim = pid.toUpperCase().trim();

	for (let i = 0, len = cached_data.length; i < len; i++) {
		const line = cached_data[i];
		const line_arr = line.split("|");

		if (line_arr.length <= 1) {
			continue;
		}

		const line_pid = line_arr[1].toUpperCase().trim();
		if (line_pid === pid_trim) {
			return line.trim();
		}
	}

	return "";
}



export async function getCachedAppsFolderID(pid) {

	let cafid = await getCachedData(pid);
	if (cafid.length <= 4) {
		return "";
	}
	let arr = cafid.split("|");
	for (let i = 0, len = arr.length; i < len; i++) {
		if (i === 4) {
			return arr[i];
		}
	}
	return "";
}

export async function getCachedGameExe(pid) {

	let cge = await getCachedData(pid);
	if (cge.length <= 5) {
		return "";
	}

	let arr = cge.split("|");
	for (let i = 0, len = arr.length; i < len; i++) {
		if (i === 5) {
			return arr[i];
		}
	}

	return "";
}

export async function getCachedGameVerticalImg(pid) {

	let cge = await getCachedData(pid);
	if (cge.length <= 2) {
		return "";
	}

	let arr = cge.split("|");
	for (let i = 0, len = arr.length; i < len; i++) {
		if (i === 2 && arr[i].includes("https")) {
			return arr[i];
		}
	}

	return "";
}

export async function getCachedGameBackgroundImg(pid) {

	let cge = await getCachedData(pid);
	if (cge.length <= 3) {
		return "";
	}

	let arr = cge.split("|");
	for (let i = 0, len = arr.length; i < len; i++) {
		if (i === 3 && arr[i].includes("https")) {
			return arr[i];
		}
	}

	return "";
}

if (pid != null && pid.length > 0) {
	console.log("Found PID: \"" + pid + "\" (length: " + pid.length + ")");
	const fpid = document.getElementById('found_pid');
	fpid.innerText = "PID: Found (" + getActualPID(pid) + ")";
}