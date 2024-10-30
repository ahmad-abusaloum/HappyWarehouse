function loadWarehouses(pageNumber = 1, pageSize = 10) {
    $.ajax({
        url: `${baseUrl}/api/Warehouse?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function (response) {
            $('#warehousesTableBody').empty();
            response.records.forEach(warehouse => {
                $('#warehousesTableBody').append(`
                        <tr>
                            <td>${warehouse.id}</td>
                            <td>${warehouse.name}</td>
                            <td>${warehouse.city}</td>
                            <td>${warehouse.country.name}</td>
                            <td>
                                <button class="btn btn-warning" onclick="window.location.href='update_warehouse.html?id=${warehouse.id}'">Update</button>
                                <button class="btn btn-info" onclick="window.location.href='warehouse_items.html?id=${warehouse.id}'">View Items</button>
                                <button class="btn btn-danger" onclick="deleteWarehouse(${warehouse.id})">Delete</button>
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
                    loadWarehouses(pageNumber + 1, pageSize);
                }
            });

            $('#prevPage').click(function () {
                if (pageNumber > 1) {
                    loadWarehouses(pageNumber - 1, pageSize);
                }
            });
        },
        error: function () {
            hundelLoginError();
        }
    });
}


function loadCountries(selectedCountryId = null) {
    $.ajax({
        url: `${baseUrl}/api/Country/all`,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function (countries) {
            $('#country').empty();  // Clear any existing options
            countries.forEach(country => {
                const isSelected = country.id === selectedCountryId ? 'selected' : '';
                $('#country').append(`<option value="${country.id}" ${isSelected}>${country.name}</option>`);
            });
        },
        error: function () {
            $('#message').html('<div class="alert alert-danger">Failed to load countries.</div>');
        }
    });
}


function createWarehouse(event) {
    event.preventDefault();

    const name = $('#name').val();
    const address = $('#address').val();
    const city = $('#city').val();
    const countryId = $('#country').val();

    $.ajax({
        url: `${baseUrl}/api/Warehouse`,
        type: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        contentType: 'application/json',
        data: JSON.stringify({
            name: name,
            address: address,
            city: city,
            countryId: parseInt(countryId)
        }),
        success: function () {
            $('#message').html('<div class="alert alert-success">Warehouse created successfully!</div>');
            $('#createWarehouseForm')[0].reset();

            redirectTo('warehouses.html');
        },
        error: function (xhr) {
            const errorMsg = xhr.responseJSON?.message || 'Failed to create warehouse.';
            $('#message').html(`<div class="alert alert-danger">${errorMsg}</div>`);
        }
    });
}


function deleteWarehouse(id) {
    if (!confirm("Are you sure you want to delete this warehouse?")) return;

    $.ajax({
        url: `${baseUrl}/api/Warehouse/${id}`,
        type: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: () => loadWarehouses(),
        error: () => alert('Failed to delete warehouse')
    });
}

function loadWarehouseDetails() {
    const id = new URLSearchParams(window.location.search).get("id");
    $.ajax({
        url: `${baseUrl}/api/Warehouse/${id}`,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function (warehouse) {
            $('#name').val(warehouse.name);
            $('#address').val(warehouse.address);
            $('#city').val(warehouse.city);
            $('#country').val(warehouse.countryId);

            loadCountries(warehouse.countryId);
        },
        error: () => { alert('Failed to load warehouse details'); }
    });
}

function updateWarehouse(event) {
    event.preventDefault();

    const id = new URLSearchParams(window.location.search).get("id");
    const data = {
        name: $('#name').val(),
        address: $('#address').val(),
        city: $('#city').val(),
        countryId: $('#country').val()
    };

    $.ajax({
        url: `${baseUrl}/api/Warehouse/${id}`,
        type: 'PUT',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: () => {
            $('#message').html('<div class="alert alert-success">Warehouse updated successfully!</div>');

            redirectTo('warehouses.html');
        },
        error: (xhr) => {
            $('#message').html(`<div class="alert alert-danger">${xhr.responseJSON?.message || 'Failed to update warehouse.'}</div>`);
        }
    });
}

function loadWarehouseItems(pageNumber = 1, pageSize = 10) {
    const warehouseId = getQueryParameter('id');
    if (!warehouseId) {
        alert("Warehouse ID is missing in the URL.");
        return;
    }

    $.ajax({
        url: `${baseUrl}/api/Warehouse/${warehouseId}/items?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function (response) {
            // Update the warehouse name
            $('#warehouseName').text(`Warehouse Items - ${response.warehouseName}`);

            // Populate items table
            const tableBody = $('#warehouseItemsTableBody');
            tableBody.empty();
            response.records.forEach(item => {
                tableBody.append(`
                            <tr>
                                <td>${item.id}</td>
                                <td>${item.name}</td>
                                <td>${item.sku}</td>
                                <td>${item.quantity}</td>
                                <td>${item.costPrice}</td>
                                <td>${item.msrpPrice || ''}</td>
                            </tr>
                        `);
            });

            // Set up pagination
            const totalPages = Math.ceil(response.totalRecords / response.pageSize);
            $('#pagination').html(`
                        <button class="btn btn-secondary" id="prevPage" ${pageNumber === 1 ? 'disabled' : ''}>Previous</button>
                        <span>Page ${response.pageNumber} of ${totalPages}</span>
                        <button class="btn btn-secondary" id="nextPage" ${pageNumber === totalPages ? 'disabled' : ''}>Next</button>
                    `);

            $('#nextPage').click(() => {
                if (pageNumber < totalPages) {
                    loadWarehouseItems(pageNumber + 1, pageSize);
                }
            });

            $('#prevPage').click(() => {
                if (pageNumber > 1) {
                    loadWarehouseItems(pageNumber - 1, pageSize);
                }
            });
        },
        error: function () {
            alert('Failed to load warehouse items');
        }
    });
}