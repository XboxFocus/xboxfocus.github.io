// Function to calculate the result
function calculateResult() {
    const form = document.getElementById("quiz-form");
    const formData = new FormData(form);

    //console.log(formData);

    for (const pair of formData.entries()) {
        const questionId = pair[0];
        // Check if the question is visible (not "display: none")
        const questionElement = document.getElementById(questionId);
        if (questionElement && window.getComputedStyle(questionElement).display !== "none") {
            userAnswers[pair[0]] = pair[1].toLowerCase(); // Convert to lowercase for case-insensitive comparison
        } else {
            userAnswers[pair[0]] = "~";
        }

        //console.log(pair[0] + " -- " + pair[1]);
    }

    // Calculate total score
    let totalScore = 0;
    for (const question in correctAnswers) {
        const userAnswer = userAnswers[question];
        if (userAnswer) {
            if (Array.isArray(correctAnswers[question])) {
                const matchingAnswer = correctAnswers[question].find(answer => userAnswer.toLowerCase().includes(answer.answer.toLowerCase()));
                if (matchingAnswer) {
                    console.log("matching: " + matchingAnswer.answer + " in " + userAnswer.toLowerCase() + " or " + correctAnswers[question][0]);
                    totalScore += matchingAnswer.score;
                }
            } else { // Check if it's a string
                const correctAnswer = String(correctAnswers[question].answer).toLowerCase();
                if (userAnswer.toLowerCase().includes(correctAnswer.toLowerCase())) {
                    totalScore += correctAnswers[question].score;
                }
            }
        }
    }

    // Clamp the total score between 0 and 100
    totalScore = Math.max(0, Math.min(100, totalScore));

    // Display result
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `<br>I'd say there's a ${totalScore}% probability`;
}


function enableDisableIfEqual(displayanswer, causequiz, consequencequiz) {
	let current_q6_state = document.getElementById(consequencequiz).style.display;
    let q4Answer = document.querySelector(`input[name="${causequiz}"]:checked`);
	if(!q4Answer) {
		q4Answer = document.querySelector(`textarea[name="${causequiz}"]`);
	}
    let qname = `${consequencequiz}-question`;
    let aname = `${consequencequiz}-answer`;
    if (q4Answer) {
        if (q4Answer.value.toLowerCase().includes(displayanswer.toLowerCase())) {
            document.getElementById(consequencequiz).style.display = "block";
            document.getElementById(consequencequiz).style.justifyContent = "center"; // Center horizontally
            document.getElementById(consequencequiz).style.alignItems = "center";
            document.getElementById(consequencequiz).style.placeItems = "center";
            document.getElementById(consequencequiz).style.margin = "auto"; // Center horizontally
            document.getElementById(consequencequiz).style.marginTop = "20px";
            document.getElementById(consequencequiz).style.marginBottom = "20px";
            document.getElementById(qname).style.display = "block";
            document.getElementById(qname).style.justifyContent = "center"; // Center horizontally
            document.getElementById(qname).style.alignItems = "center";
            document.getElementById(qname).style.placeItems = "center";
            document.getElementById(qname).style.margin = "auto"; // Center horizontally
            document.getElementById(aname).style.display = "block";
            document.getElementById(aname).style.justifyContent = "center"; // Center horizontally
            document.getElementById(aname).style.alignItems = "center";
            document.getElementById(aname).style.placeItems = "center";
            document.getElementById(aname).style.margin = "auto"; // Center horizontally
        } else {
            document.querySelector(`textarea[name="${consequencequiz}"]`).value = ""; // Clear the textarea
            document.getElementById(aname).style.display = "none";
            document.getElementById(qname).style.display = "none";
            document.getElementById(consequencequiz).style.display = "none";
        }
    } else {
        document.querySelector(`textarea[name="${consequencequiz}"]`).value = ""; // Clear the textarea
        document.getElementById(aname).style.display = "none";
        document.getElementById(qname).style.display = "none";
        document.getElementById(consequencequiz).style.display = "none";
    }
	let same = document.getElementById(consequencequiz).style.display == current_q6_state;
    return q4Answer && same;
}


function enableDisableIfNotEqual(displayanswer, causequiz, consequencequiz) {
    let current_q6_state = document.getElementById(consequencequiz).style.display;
    let q4Answer = document.querySelector(`input[name="${causequiz}"]:checked`);
	if(!q4Answer) {
		q4Answer = document.querySelector(`textarea[name="${causequiz}"]`);
	}
    let qname = `${consequencequiz}-question`;
    let aname = `${consequencequiz}-answer`;
    if (q4Answer) {
        if (!q4Answer.value.toLowerCase().includes(displayanswer.toLowerCase())) {
            document.getElementById(consequencequiz).style.display = "block";
            document.getElementById(consequencequiz).style.justifyContent = "center"; // Center horizontally
            document.getElementById(consequencequiz).style.alignItems = "center";
            document.getElementById(consequencequiz).style.placeItems = "center";
            document.getElementById(consequencequiz).style.margin = "auto"; // Center horizontally
            document.getElementById(consequencequiz).style.marginTop = "20px";
            document.getElementById(consequencequiz).style.marginBottom = "20px";
            document.getElementById(qname).style.display = "block";
            document.getElementById(qname).style.justifyContent = "center"; // Center horizontally
            document.getElementById(qname).style.alignItems = "center";
            document.getElementById(qname).style.placeItems = "center";
            document.getElementById(qname).style.margin = "auto"; // Center horizontally
            document.getElementById(aname).style.display = "block";
            document.getElementById(aname).style.justifyContent = "center"; // Center horizontally
            document.getElementById(aname).style.alignItems = "center";
            document.getElementById(aname).style.placeItems = "center";
            document.getElementById(aname).style.margin = "auto"; // Center horizontally
        } else {
            document.querySelector(`textarea[name="${consequencequiz}"]`).value = ""; // Clear the textarea
            document.getElementById(aname).style.display = "none";
            document.getElementById(qname).style.display = "none";
            document.getElementById(consequencequiz).style.display = "none";
        }
    } else {
        document.querySelector(`textarea[name="${consequencequiz}"]`).value = ""; // Clear the textarea
        document.getElementById(aname).style.display = "none";
        document.getElementById(qname).style.display = "none";
        document.getElementById(consequencequiz).style.display = "none";
    }
    let same = document.getElementById(consequencequiz).style.display == current_q6_state;
    return q4Answer && same;
}

function doreset() {

    for (let i = 0; i <= 99; i++) {
        const questionName = `q${i}`;
        if (!document) {
            break;
        }
        const textarea = document.querySelector(`textarea[name="${questionName}"]`);
        if (textarea) {
            textarea.value = ""; // Clear the textarea
        }
        const inputField = document.querySelector(`input[name="${questionName}"]`);
        if (inputField) {
            inputField.value = ""; // Clear the input field
        }
        const radioButtons = document.querySelectorAll(`input[type="radio"]`);
        if (radioButtons) {
            radioButtons.forEach(radio => {
                if (radio.name == questionName) {
                    //console.log("Unchecked: " + newname);
                    radio.checked = false;
                } else {
                    //console.log("Not unchecking: " + radio.name);
                }
            });
        }
    }

    checkAnswer();
}
