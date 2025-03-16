
//login 

document.getElementById("loginBtn").addEventListener("click", function () {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    fetch("https://yourdomain.com/login.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            localStorage.setItem("loggedInJudge", data.username);
            window.location.href = "judge-dashboard.html";
        } else {
            alert("Invalid username or password.");
        }
    })
    .catch(error => console.error("Error:", error));
});



document.addEventListener("DOMContentLoaded", function () {
    // Check if user is already logged in
    if (localStorage.getItem("loggedIn") === "true") {
        document.getElementById("login-container").classList.add("hidden");
        document.getElementById("leaderboard-container").classList.remove("hidden");
    }
});

function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (username === "admin" && password === "admin1") {
        localStorage.setItem("loggedIn", "true");
        document.getElementById("login-container").classList.add("hidden");
        document.getElementById("leaderboard-container").classList.remove("hidden");
    } else {
        alert("Invalid username or password");
    }
}

function logout() {
    localStorage.removeItem("loggedIn");
    document.getElementById("leaderboard-container").classList.add("hidden");
    document.getElementById("login-container").classList.remove("hidden");
}


// Close menu when clicking outside
document.addEventListener("click", function (event) {
    let sidebar = document.getElementById("sidebar");
    let menuIcon = document.querySelector(".menu-icon");

    if (!sidebar.contains(event.target) && !menuIcon.contains(event.target)) {
        sidebar.style.right = "-350px";
    }
});


// Real-Time update of Leaderboard

document.querySelectorAll('.score').forEach(input => {
    input.addEventListener('input', updateScores);
});

function updateScores() {
    const rows = document.querySelectorAll('#leaderboard-body tr');
    const scores = [];

    rows.forEach(row => {
        let total = 0;
        row.querySelectorAll('.score').forEach(input => {
            total += parseFloat(input.value) || 0;
        });
        row.querySelector('.final-score').textContent = total;
        scores.push({ row, total });
    });

    scores.sort((a, b) => b.total - a.total);
    
    document.getElementById('leaderboard-body').innerHTML = '';
    scores.forEach((entry, index) => {
        entry.row.classList.remove('highlight', 'rank-1');
        if (index === 0) {
            entry.row.classList.add('rank-1');
        }
        document.getElementById('leaderboard-body').appendChild(entry.row);
        setTimeout(() => entry.row.classList.add('highlight'), 100);
    });
}


// Participant Account Management
function addParticipant() {
    let teamName = document.getElementById("teamName").value;
    let projectTitle = document.getElementById("projectTitle").value;

    if (teamName === "" || projectTitle === "") {
        alert("Please enter both Team Name and Project Title!");
        return;
    }

    let table = document.getElementById("participantTable");

    // Create a new row
    let row = table.insertRow();
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);

    // Insert values into the row
    cell1.textContent = teamName;
    cell2.textContent = projectTitle;
    
    // Create delete button
    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = function () {
        table.deleteRow(row.rowIndex - 1);
    };
    cell3.appendChild(deleteBtn);

    // Clear input fields after adding
    document.getElementById("teamName").value = "";
    document.getElementById("projectTitle").value = "";
}


// Fetch and display participants
async function loadParticipants() {
    let response = await fetch("http://localhost:5500/api/participants");  // <-- Use port 5216
    let participants = await response.json();
    let table = document.getElementById("participantTable");
    table.innerHTML = "";

    participants.forEach((p) => {
        let row = table.insertRow();
        row.innerHTML = `<td>${p.teamName}</td><td>${p.projectTitle}</td>`;
    });
}

window.onload = loadParticipants;

// Fetch and display participants
async function loadParticipants() {
    let response = await fetch("http://localhost:5500/api/participants");
    let participants = await response.json();
    let table = document.getElementById("participantTable");
    table.innerHTML = "";
    
    participants.forEach((p) => {
        let row = table.insertRow();
        row.innerHTML = `<td>${p.teamName}</td><td>${p.projectTitle}</td>`;
    });
}

window.onload = loadParticipants;

// Judge Account Management

document.addEventListener("DOMContentLoaded", function () {
    loadJudges();
});

function addJudge() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    if (username === "" || password === "") {
        alert("Please enter both username and password.");
        return;
    }

    let judges = JSON.parse(localStorage.getItem("judges")) || [];
    judges.push({ username, password });
    localStorage.setItem("judges", JSON.stringify(judges));

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    loadJudges();
}

function loadJudges() {
    let judges = JSON.parse(localStorage.getItem("judges")) || [];
    let tableBody = document.getElementById("judgeTable");
    tableBody.innerHTML = "";

    judges.forEach((judge, index) => {
        let row = `<tr>
            <td>${judge.username}</td>
            <td>${judge.password}</td>
            <td><button class='delete-btn' onclick='deleteJudge(${index})'>Delete</button></td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

function deleteJudge(index) {
    let judges = JSON.parse(localStorage.getItem("judges")) || [];
    judges.splice(index, 1);
    localStorage.setItem("judges", JSON.stringify(judges));
    loadJudges();
}

function toggleMenu(event) {
    let sidebar = document.getElementById("sidebar");
    sidebar.style.display = sidebar.style.display === "block" ? "none" : "block";
    event.stopPropagation();
}

document.addEventListener("click", function (event) {
    let sidebar = document.getElementById("sidebar");
    if (event.target !== sidebar && !sidebar.contains(event.target)) {
        sidebar.style.display = "none";
    }
});

function showLeaderboard() { alert("Redirecting to Leaderboard..."); }
function showParticipants() { alert("Redirecting to Participants..."); }
function showJudges() { alert("Redirecting to Judges..."); }
function showSettings() { alert("Redirecting to Settings..."); }
function logout() { alert("Logging out..."); }

//Judge Evaluation

function loadJudgeName() {
    let judgeName = localStorage.getItem("judgeName") || "Judge";
    document.getElementById("judgeGreeting").innerText = "Welcome, " + judgeName + "!";
}

function updateScore(slider) {
    let id = slider.id;
    document.getElementById(id + "Score").innerText = slider.value;
    calculateTotalScore();
}

function calculateTotalScore() {
    let pd = parseFloat(document.getElementById("projectDesign").value) * 0.25;
    let func = parseFloat(document.getElementById("functionality").value) * 0.30;
    let pres = parseFloat(document.getElementById("presentation").value) * 0.15;
    let wd = parseFloat(document.getElementById("webDesign").value) * 0.10;
    let imp = parseFloat(document.getElementById("impact").value) * 0.20;

    let total = pd + func + pres + wd + imp;
    document.getElementById("totalScore").innerText = total.toFixed(2);
}

function submitEvaluation() {
    let judgeName = localStorage.getItem("judgeName") || "Judge";
    let totalScore = document.getElementById("totalScore").innerText;
    let comments = document.getElementById("comments").value;

    alert("Evaluation Submitted!\nJudge: " + judgeName + "\nTotal Score: " + totalScore + "\nComments: " + comments);

    // Reset form
    document.getElementById("evaluationForm").reset();
    document.getElementById("totalScore").innerText = "0";
}
