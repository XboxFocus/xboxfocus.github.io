export const urlParams = new URLSearchParams(window.location.search);
export const pid = urlParams.get('pid').replace("/\n/g", "").trim();
export const gname = urlParams.get('gname').replace("/\n/g", "").trim();

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

    return removeAfterSlash(my_pid);
}

export function getSearchableName(my_name) {

    let ret = my_name.replace(" ", "+")
    return ret;
}

if (pid != null && pid.length > 0) {
    console.log("Found PID: \"" + pid + "\" (length: " + pid.length + ")");
    const fpid = document.getElementById('found_pid');
    fpid.innerText = "PID: Found (" + getActualPID(pid) + ")";
}