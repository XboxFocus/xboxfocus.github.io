import { urlParams, pid, gname, getActualPID, getActualName } from './common.js';

const nametext = document.getElementById('name');
if (gname != null && gname.length > 0) {
    nametext.textContent = getActualName(gname);
    console.log("Found name: \"" + gname + "\" (length: " + gname.length + ")");
    const fpid = document.getElementById('found_name');
    fpid.textContent = "Name: Found (" + getActualName(gname) + ")";
} else {
    nametext.textContent = getActualPID(pid);
}