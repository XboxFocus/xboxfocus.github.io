export const urlParams = new URLSearchParams(window.location.search);
export const pid = urlParams.get('pid')?.replace("/\n/g", "")?.trim();
export const gname = urlParams.get('gname')?.replace("/\n/g", "")?.trim();

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

    try {
        let cache_filename = getCacheDataFilename();
        const response = await fetch(cache_filename);
        if (!response.ok) {
            console.error(`Error fetching file: ${response.status} ${response.statusText}`);
            return "";
        }
        const fileContent = await response.text();

        const lines = fileContent.split('\n');

        for (const line of lines) {
            let line_arr = line.split("|");
            if (line_arr.length > 1) {
                let line_pid = line_arr[1].toUpperCase().trim();
                if (line_pid == pid.toUpperCase().trim()) {
                    return line.trim();
                }
            }
        }

        return "";
    } catch (error) {
        console.error(`Error reading file: ${error.message}`);
        return "";
    }
}


export async function getCachedAppsFolderID(pid) {
    try {
        let cafid = await getCachedData(pid);
        if (cafid.length > 4) {
            let arr = cafid.split("|");
            let i = 0;
            for (const line of arr) {
                if (i == 4) {
                    return line;
                }
                i = i + 1;
            }
        }
        return "";
    } catch (e) {
        console.error(`Error in getCachedAppsFolderID: ${e}`);
        return "";
    }
}

export async function getCachedGameExe(pid) {
    try {
        let cge = await getCachedData(pid);
        if (cge.length > 5) {
            let arr = cge.split("|");
            let i = 0;
            for (const line of arr) {
                if (i == 5) {
                    return line;
                }
                i = i + 1;
            }
        }
        return "";
    } catch (e) {
        console.error(`Error in getCachedGameExe: ${e}`);
        return "";
    }
}

export async function getCachedGameVerticalImg(pid) {
    try {
        let cge = await getCachedData(pid);
        if (cge.length > 2) {
            let arr = cge.split("|");
            let i = 0;
            for (const line of arr) {
                if (i == 2 && line.includes("https")) {
                    return line;
                }
                i = i + 1;
            }
        }
        return "";
    } catch (e) {
        console.error(`Error in getCachedGameExe: ${e}`);
        return "";
    }
}

export async function getCachedGameBackgroundImg(pid) {
    try {
        let cge = await getCachedData(pid);
        if (cge.length > 3) {
            let arr = cge.split("|");
            let i = 0;
            for (const line of arr) {
                if (i == 3 && line.includes("https")) {
                    return line;
                }
                i = i + 1;
            }
        }
        return "";
    } catch (e) {
        console.error(`Error in getCachedGameExe: ${e}`);
        return "";
    }
}

if (pid != null && pid.length > 0) {
    console.log("Found PID: \"" + pid + "\" (length: " + pid.length + ")");
    const fpid = document.getElementById('found_pid');
    fpid.innerText = "PID: Found (" + getActualPID(pid) + ")";
}