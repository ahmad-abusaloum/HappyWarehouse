function loadCountries(pageNumber = 1, pageSize = 10) {
    $.ajax({
        url: `${baseUrl}/api/Country?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function (response) {
            $('#countriesTableBody').empty();
            response.records.forEach(country => {
                $('#countriesTableBody').append(`
                        <tr>
                            <td>${country.id}</td>
                            <td>${country.name}</td>
                            <td>
                                <button class="btn btn-warning" onclick="window.location.href='update_country.html?id=${country.id}'">Update</button>
                                <button class="btn btn-danger" onclick="deleteCountry(${country.id})">Delete</button>
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
                    loadCountries(pageNumber + 1, pageSize);
                }
            });

            $('#prevPage').click(function () {
                if (pageNumber > 1) {
                    loadCountries(pageNumber - 1, pageSize);
                }
            });
        },
        error: function () {
            hundelLoginError();
        }
    });
}

$('#createCountryForm').submit(function (e) {
    e.preventDefault();
    const countryName = $('#countryName').val();

    $.ajax({
        url: `${baseUrl}/api/Country`,
        type: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        contentType: 'application/json',
        data: JSON.stringify({ name: countryName }),
        success: function () {
            $('#message').html('<div class="alert alert-success">Country created successfully!</div>');
            $('#createCountryForm')[0].reset();

            redirectTo('countries.html');
        },
        error: function () {
            $('#message').html('<div class="alert alert-danger">Failed to create country.</div>');
        }
    });
});

function loadCountryDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const countryId = urlParams.get('id');
    if (!countryId) {
        $('#message').html('<div class="alert alert-danger">Country ID not found.</div>');
        return;
    }

    $.ajax({
        url: `${baseUrl}/api/Country/${countryId}`,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function (country) {
            $('#countryName').val(country.name);
        },
        error: function () {
            $('#message').html('<div class="alert alert-danger">Failed to load country details.</div>');
        }
    });
}

$('#updateCountryForm').submit(function (e) {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const countryId = urlParams.get('id');

    const updatedCountry = {
        id: countryId,
        name: $('#countryName').val()
    };

    $.ajax({
        url: `${baseUrl}/api/Country/${countryId}`,
        type: 'PUT',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        contentType: 'application/json',
        data: JSON.stringify(updatedCountry),
        success: function () {
            $('#message').html('<div class="alert alert-success">Country updated successfully!</div>');

            redirectTo('countries.html');
        },
        error: function () {
            $('#message').html('<div class="alert alert-danger">Failed to update country.</div>');
        }
    });
});

function deleteCountry(id) {
    if (!confirm("Are you sure you want to delete this country?")) return;

    $.ajax({
        url: `${baseUrl}/api/Country/${id}`,
        type: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function () {
            alert('Country deleted successfully');
            loadCountries(); // Refresh the country list after deletion
        },
        error: function () {
            alert('Failed to delete country');
        }
    });
}
