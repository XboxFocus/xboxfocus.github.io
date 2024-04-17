export const urlParams = new URLSearchParams(window.location.search);
export const pid = urlParams.get('pid')?.replace("/\n/g", "")?.trim();
export const gname = urlParams.get('gname')?.replace("/\n/g", "")?.trim();

export var cached_data = []

export function getActualName(my_name) {

	const ret = my_name.replace("_", "'");
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

	const ret = my_name.replace(" ", "+")
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
		const http = line.indexOf("http");
		const has_pid = line.toUpperCase().trim().indexOf(pid_trim);

		if (has_pid > 0 && (has_pid < http || http < 0)) {
			return line.trim();
		}
	}

	return "";
}

export async function getCachedAppsFolderID(pid) {

	const cafid = await getCachedData(pid);
	const arr = cafid.split("|");
	const ret = arr[4] || "";
	return ret;
}

export async function getCachedGameExe(pid) {

	const cge = await getCachedData(pid);
	const arr = cge.split("|");
	const ret = arr[5] || "";
	return ret;
}

export async function getCachedGameVerticalImg(pid) {

	const cge = await getCachedData(pid);
	const arr = cge.split("|");
	const img = arr[2] || "";
	if (img.includes("https")) {
		return img;
	}

	return "";
}

export async function getCachedGameBackgroundImg(pid) {

	const cge = await getCachedData(pid);
	const arr = cge.split("|");
	const img = arr[3] || "";
	if (img.includes("https")) {
		return img;
	}

	return "";
}

if (pid != null && pid.length > 0) {
	console.log("Found PID: \"" + pid + "\" (length: " + pid.length + ")");
	const fpid = document.getElementById('found_pid');
	fpid.innerText = "PID: Found (" + getActualPID(pid) + ")";
}