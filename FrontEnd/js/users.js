$('#createUserForm').submit(function (e) {
    e.preventDefault();
    const email = $('#email').val();
    const fullName = $('#fullName').val();
    const roleId = $('#role').val();
    const isActive = $('#isActive').val() === 'true';
    const password = $('#password').val();

    $.ajax({
        url: `${baseUrl}/api/User`,
        type: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        contentType: 'application/json',
        data: JSON.stringify({
            email,
            fullName,
            roleId,
            isActive,
            password
        }),
        success: function () {
            $('#message').html('<div class="alert alert-success">User created successfully!</div>');
            $('#createUserForm')[0].reset();

            redirectTo('users.html');
        },
        error: function (xhr) {
            if (xhr.responseJSON && xhr.responseJSON.message === "Invalid role.") {
                $('#message').html('<div class="alert alert-danger">Invalid role selected.</div>');
            } else {
                $('#message').html('<div class="alert alert-danger">Failed to create user.</div>');
            }
        }
    });
});

function checkEmailExists() {
    const email = $('#email').val();
    const userId = getQueryParameter('id');

    if (email) {
        $.ajax({
            url: `${baseUrl}/api/User/check-email`,
            type: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            contentType: 'application/json',
            data: { email: email, userId: userId || null },
            success: function (response) {
                if (response.exists) {
                    $('#emailError').show().text('This email already exists.');
                } else {
                    $('#emailError').hide();
                }
            },
            error: function () {
                $('#message').html('<div class="alert alert-danger">Failed to validate email.</div>');
            }
        });
    } else {
        $('#emailError').hide();
    }
}

function loadUsers(pageNumber = 1, pageSize = 10) {
    $.ajax({
        url: `${baseUrl}/api/User?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function (response) {
            $('#usersTableBody').empty();
            response.records.forEach(user => {
                const deleteButton = user.role.id === 1
                    ? `<button class="btn btn-danger" disabled title="Cannot delete Admin users">Delete</button>`
                    : `<button class="btn btn-danger" onclick="deleteUser(${user.id})">Delete</button>`;

                $('#usersTableBody').append(`
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.email}</td>
                            <td>${user.fullName}</td>
                            <td>${user.role.name}</td>
                            <td>${user.isActive ? 'Active' : 'Inactive'}</td>
                            <td>
                                <button class="btn btn-warning" onclick="window.location.href='update_user.html?id=${user.id}'">Update</button>
                                ${deleteButton}
                                <button class="btn btn-info" onclick="openChangePasswordModal(${user.id})">Change Password</button>
                            </td>
                        </tr>
                    `);
            });

            const totalPages = Math.ceil(response.totalRecords / response.pageSize);

            $('#pagination').html(`
                    <button class="btn btn-secondary" id="prevPage" ${pageNumber === 1 ? 'disabled' : ''}>Previous</button>
                    <span>Page ${response.pageNumber} of ${totalPages}</span>
                    <button class="btn btn-secondary" id="nextPage" ${pageNumber === totalPages ? 'disabled' : ''}>Next</button>
                `);

            $('#nextPage').click(function () {
                if (pageNumber < totalPages) {
                    loadUsers(pageNumber + 1, pageSize);
                }
            });

            $('#prevPage').click(function () {
                if (pageNumber > 1) {
                    loadUsers(pageNumber - 1, pageSize);
                }
            });
        },
        error: function () {
            hundelLoginError();
        }
    });
}

function loadUserDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    if (!userId) {
        $('#message').html('<div class="alert alert-danger">User ID not found.</div>');
        return;
    }

    $.ajax({
        url: `${baseUrl}/api/User/${userId}`,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function (user) {
            $('#email').val(user.email);
            $('#fullName').val(user.fullName);
            $('#isActive').val(user.isActive.toString());
            loadRoles(user.roleId);
        },
        error: function () {
            $('#message').html('<div class="alert alert-danger">Failed to load user details.</div>');
        }
    });
}

function loadRoles(selectedRoleId) {
    $.ajax({
        url: `${baseUrl}/api/Role`,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function (roles) {
            $('#role').empty();
            roles.forEach(role => {
                $('#role').append(`<option value="${role.id}" ${role.id === selectedRoleId ? 'selected' : ''}>${role.name}</option>`);
            });
        },
        error: function () {
            $('#message').html('<div class="alert alert-danger">Failed to load roles.</div>');
        }
    });
}

$('#updateUserForm').submit(function (e) {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    const updatedUser = {
        email: $('#email').val(),
        fullName: $('#fullName').val(),
        roleId: $('#role').val(),
        isActive: $('#isActive').val() === 'true'
    };

    $.ajax({
        url: `${baseUrl}/api/User/${userId}`,
        type: 'PUT',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        contentType: 'application/json',
        data: JSON.stringify(updatedUser),
        success: function () {
            $('#message').html('<div class="alert alert-success">User updated successfully!</div>');

            redirectTo('users.html');
        },
        error: function (xhr) {
            if (xhr.responseJSON && xhr.responseJSON.message === "Invalid role.") {
                $('#message').html('<div class="alert alert-danger">Invalid role selected.</div>');
            } else {
                $('#message').html('<div class="alert alert-danger">Failed to update user.</div>');
            }
        }
    });
});

function deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
        $.ajax({
            url: `${baseUrl}/api/User/${userId}`,
            type: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            success: function () {
                alert('User deleted successfully');
                loadUsers();
            },
            error: function (xhr) {
                if (xhr.status === 404) {
                    alert('User not found');
                } else if (xhr.status === 400 && xhr.responseJSON && xhr.responseJSON.message) {
                    alert(xhr.responseJSON.message);
                } else {
                    alert('Failed to delete user');
                }
            }
        });
    }
}


// Function to open the modal and store the user ID
function openChangePasswordModal(userId) {
    $('#userIdToChangePassword').val(userId);
    $('#newPassword').val(''); // Clear any previous input
    $('#changePasswordModal').modal('show');
}

// Function to change the user's password
function changePassword() {
    const userId = $('#userIdToChangePassword').val();
    const newPassword = $('#newPassword').val();

    if (!newPassword) {
        alert('Password cannot be empty');
        return;
    }

    $.ajax({
        url: `${baseUrl}/api/User/change-password/${userId}`,
        type: 'PUT',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        contentType: 'application/json',
        data: JSON.stringify({ newPassword }),
        success: function () {
            alert('Password changed successfully');
            $('#changePasswordModal').modal('hide');
        },
        error: function (xhr) {
            if (xhr.status === 404) {
                alert('User not found');
            } else if (xhr.status === 400) {
                alert(xhr.responseText); // Show specific error message
            } else {
                alert('Failed to change password');
            }
        }
    });
}
