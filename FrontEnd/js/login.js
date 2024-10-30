$('#loginForm').submit(function (e) {
    e.preventDefault();
    var email = $('#email').val();
    var password = $('#password').val();

    $.ajax({
        url: baseUrl + '/api/User/login',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email: email, password: password }),
        success: function (response) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', response.roleName);
            localStorage.setItem('fullName', response.fullName);
            window.location.href = 'Pages/Dashboard.html';
        },
        error: function (xhr) {
            let errorMessage = 'Invalid login credentials';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            }
            $('#error').text(errorMessage).fadeIn(300).fadeOut(300).fadeIn(300);
        }
    });
});
