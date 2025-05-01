function addOption() {
    const input = document.createElement("input");
    input.className = "option-input";
    input.type = "text";
    input.placeholder = "Another Option";
    document.getElementById("optionsContainer").appendChild(input);
}

async function createPoll() {
    const question = document.getElementById("question").value;
    const optionInputs = document.querySelectorAll(".option-input");
    const options = Array.from(optionInputs)
        .map((opt) => opt.value)
        .filter((o) => o);

    // Validate that question and options are not empty
    if (!question.trim() || options.length < 2) {
        Swal.fire({
            icon: "error",
            title: "Oops!",
            text: "Please provide a valid poll question and at least two options!",
            confirmButtonColor: "#FF6347",
        });
        return;
    }

    const res = await fetch("http://localhost:8080/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options }),
    });

    const data = await res.json();

    // SweetAlert2 with copy icon for Poll ID
    Swal.fire({
        icon: "success",
        title: "Poll Created!",
        html: `Poll ID: <strong id="pollId">${data.alphaNumId}</strong>
        <span class="copy-icon" onclick="copyToClipboard()">&#128203;</span>`,
        confirmButtonColor: "#4CAF50",
    });

    // Reset the form
    document.getElementById("question").value = "";
    document
        .querySelectorAll(".option-input")
        .forEach((input) => (input.value = ""));
}

function copyToClipboard() {
    const pollId = document.getElementById("pollId").textContent;
    const el = document.createElement("textarea");
    el.value = pollId;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    // SweetAlert2 confirmation for copied
    Swal.fire({
        icon: "info",
        title: "Poll ID Copied!",
        text: "You can now paste it anywhere.",
        confirmButtonColor: "#4CAF50",
    });
}

async function loadPoll() {
    const pollId = document.getElementById("votePollId").value.trim();

    if (!pollId) {
        Swal.fire({
            icon: "error",
            title: "Poll ID Missing!",
            text: "Please enter a valid Poll ID to vote.",
            confirmButtonColor: "#FF6347",
        });
        return;
    }

    Swal.fire({
        title: "Loading Poll...",
        html: '<div class="loading">Loading...</div>',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    try {
        const res = await fetch(`http://localhost:8080/polls/${pollId}`);
        if (!res.ok) throw new Error("Poll not found");

        const data = await res.json();
        if (!data || !data.options || data.options.length === 0) {
            throw new Error("Invalid poll data");
        }

        let formHtml = `<h3 style="margin-bottom: 10px;">${data.question}</h3>`;
        data.options.forEach((opt) => {
            formHtml += `
          <div style="text-align: left; margin: 8px 0;">
            <label>
              <input type="radio" name="voteOption" value="${opt.id}" />
              ${opt.option}
            </label>
          </div>`;
        });

        Swal.fire({
            title: "Cast Your Vote",
            html: `<div style="text-align: left;">${formHtml}</div>`,
            showCancelButton: true,
            confirmButtonText: "Vote",
            confirmButtonColor: "#4CAF50",
            cancelButtonColor: "#FF6347",
            preConfirm: async () => {
                const selected = document.querySelector(
                    'input[name="voteOption"]:checked'
                );
                if (!selected) {
                    Swal.showValidationMessage("Please select an option to vote.");
                    return false;
                }

                try {
                    await fetch(`http://localhost:8080/polls/${pollId}/vote`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ optionId: selected.value }),
                    });

                    Swal.fire({
                        icon: "success",
                        title: "Vote Submitted!",
                        text: "Thank you for participating.",
                        confirmButtonColor: "#4CAF50",
                    });

                    // Clear the input
                    document.getElementById("votePollId").value = "";
                } catch (err) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Something went wrong while submitting your vote.",
                        confirmButtonColor: "#FF6347",
                    });
                }
            },
        });
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Poll Not Found",
            text: "The poll ID you entered does not exist or is invalid.",
            confirmButtonColor: "#FF6347",
        });

        document.getElementById("voteArea").innerHTML = "";
    }
}

async function vote(pollId) {
    const selected = document.querySelector("input[name='option']:checked");
    if (!selected) {
        // SweetAlert2 Error Alert if no option is selected
        Swal.fire({
            icon: "error",
            title: "Oops!",
            text: "Please select an option!",
            confirmButtonColor: "#FF6347",
        });
        return;
    }

    await fetch(`http://localhost:8080/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selected.value }),
    });

    // SweetAlert2 Success Alert after voting
    Swal.fire({
        icon: "success",
        title: "Vote Submitted!",
        text: "Thank you for voting.",
        confirmButtonColor: "#4CAF50",
    });

    document.getElementById("voteArea").innerHTML = "";
    document.getElementById("votePollId").value = "";
}

async function viewResults() {
    const pollId = document.getElementById("resultPollId").value.trim();

    if (!pollId) {
        Swal.fire({
            icon: "error",
            title: "Poll ID Missing!",
            text: "Please enter a valid Poll ID to view the results.",
            confirmButtonColor: "#FF6347",
        });
        return;
    }

    Swal.fire({
        title: "Fetching Results...",
        html: '<div class="loading">Loading...</div>',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    try {
        const res = await fetch(`http://localhost:8080/polls/${pollId}/results`);

        if (!res.ok) {
            throw new Error("Poll not found");
        }

        const data = await res.json();

        if (!data || !data.options) {
            throw new Error("No results yet");
        }

        let resultsHtml = `<h3>Results for: ${data.question}</h3>`;
        resultsHtml += '<div class="results-container">';

        const totalVotes = data.options.reduce(
            (acc, option) => acc + option.vote,
            0
        );

        data.options.forEach((option) => {
            const percentage = totalVotes ? (option.vote / totalVotes) * 100 : 0;
            resultsHtml += `
          <div class="result-row">
            <div class="option-label">${option.option}</div>
            <div class="progress-container">
              <div class="progress-bar" style="width: ${percentage}%;">
                ${option.vote} (${Math.round(percentage)}%)
              </div>
            </div>
          </div>`;
        });

        resultsHtml += "</div>";

        Swal.fire({
            icon: "info",
            title: "Poll Results",
            html: resultsHtml,
            width: "600px",
            padding: "20px",
            showConfirmButton: true,
            confirmButtonColor: "#4CAF50",
        });
    } catch (err) {
        Swal.fire({
            icon: "error",
            title: "Invalid Poll ID",
            text: "Poll not found or results are unavailable.",
            confirmButtonColor: "#FF6347",
        });
    }

    document.getElementById("resultPollId").value = "";
}
