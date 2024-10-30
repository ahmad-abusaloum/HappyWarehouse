const baseUrl = "https://localhost:7251";

$(document).ready(function(){
    $('#logoutBtn').click(function(e) {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = '../../login.html';
    });
});

function hundelLoginError() {
    window.location.href = '../../login.html';
}

function goBack() {
    window.history.back();
}

function redirectTo(url, delay = 500) {
    setTimeout(function () {
        window.location.href = url;
    }, delay);
}

function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

document.addEventListener("DOMContentLoaded", function () {
    const userFullName = localStorage.getItem('fullName');
    if (userFullName) {
        document.getElementById('userFullName').textContent = userFullName;
    }

    const userRole = localStorage.getItem('role');
    if (userRole === 'Admin') {
        document.getElementById('logsPage').style.display = 'block';
    }
});
