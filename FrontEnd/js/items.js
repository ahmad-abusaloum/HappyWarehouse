function loadItems(pageNumber = 1, pageSize = 10) {
    $.ajax({
        url: `${baseUrl}/api/Item?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function (response) {
            $('#itemsTableBody').empty();
            response.records.forEach(item => {
                $('#itemsTableBody').append(`
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.name}</td>
                            <td>${item.sku}</td>
                            <td>${item.quantity}</td>
                            <td>${item.costPrice}</td>
                            <td>${item.msrpPrice || ''}</td>
                            <td>${item.warehouse.name}</td>
                            <td>
                                <button class="btn btn-warning" onclick="window.location.href='update_item.html?id=${item.id}'">Update</button>
                                <button class="btn btn-danger" onclick="deleteItem(${item.id})">Delete</button>
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
                    loadItems(pageNumber + 1, pageSize);
                }
            });

            $('#prevPage').click(function () {
                if (pageNumber > 1) {
                    loadItems(pageNumber - 1, pageSize);
                }
            });
        },
        error: function () {
            hundelLoginError();
        }
    });
}

function loadWarehouses(selectedWarehouseId) {
    $.ajax({
        url: `${baseUrl}/api/Warehouse/all`,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function (warehouses) {
            $('#warehouseId').empty();
            warehouses.forEach(warehouse => {
                $('#warehouseId').append(`<option value="${warehouse.id}" ${warehouse.id === selectedWarehouseId ? 'selected' : ''}>${warehouse.name}</option>`);
            });
        },
        error: function () {
            $('#message').html('<div class="alert alert-danger">Failed to load warehouses.</div>');
        }
    });
}

$('#createItemForm').submit(function (e) {
    e.preventDefault();

    const newItem = {
        name: $('#name').val(),
        sku: $('#sku').val(),
        quantity: $('#quantity').val(),
        costPrice: $('#costPrice').val(),
        msrpPrice: $('#msrpPrice').val(),
        warehouseId: $('#warehouseId').val()
    };

    if (newItem.quantity < 1) {
        $('#message').html('<div class="alert alert-danger">Quantity must be at least 1.</div>');
        return;
    }
    if (newItem.costPrice < 0 || (newItem.msrpPrice !== null && newItem.msrpPrice < 0)) {
        $('#message').html('<div class="alert alert-danger">Cost and MSRP Prices must be positive values.</div>');
        return;
    }

    $.ajax({
        url: `${baseUrl}/api/Item`,
        type: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        contentType: 'application/json',
        data: JSON.stringify(newItem),
        success: function () {
            $('#message').html('<div class="alert alert-success">Item created successfully!</div>');
            $('#createItemForm')[0].reset();

            redirectTo('items.html');
        },
        error: function () {
            $('#message').html('<div class="alert alert-danger">Failed to create item.</div>');
        }
    });
});

function loadItemDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');
    if (!itemId) {
        $('#message').html('<div class="alert alert-danger">Item ID not found.</div>');
        return;
    }

    $.ajax({
        url: `${baseUrl}/api/Item/${itemId}`,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function (item) {
            $('#name').val(item.name);
            $('#sku').val(item.sku);
            $('#quantity').val(item.quantity);
            $('#costPrice').val(item.costPrice);
            $('#msrpPrice').val(item.msrpPrice || '');
            loadWarehouses(item.warehouseId);
        },
        error: function () {
            $('#message').html('<div class="alert alert-danger">Failed to load item details.</div>');
        }
    });
}

$('#updateItemForm').submit(function (e) {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');

    const updatedItem = {
        name: $('#name').val(),
        sku: $('#sku').val(),
        quantity: $('#quantity').val(),
        costPrice: $('#costPrice').val(),
        msrpPrice: $('#msrpPrice').val(),
        warehouseId: $('#warehouseId').val()
    };

    if (updatedItem.quantity < 1) {
        $('#message').html('<div class="alert alert-danger">Quantity must be at least 1.</div>');
        return;
    }
    if (updatedItem.costPrice < 0 || (updatedItem.msrpPrice !== null && updatedItem.msrpPrice < 0)) {
        $('#message').html('<div class="alert alert-danger">Cost and MSRP Prices must be positive values.</div>');
        return;
    }

    $.ajax({
        url: `${baseUrl}/api/Item/${itemId}`,
        type: 'PUT',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        contentType: 'application/json',
        data: JSON.stringify(updatedItem),
        success: function () {
            $('#message').html('<div class="alert alert-success">Item updated successfully!</div>');

            redirectTo('items.html');
        },
        error: function () {
            $('#message').html('<div class="alert alert-danger">Failed to update item.</div>');
        }
    });
});

function deleteItem(itemId) {
    if (confirm("Are you sure you want to delete this item?")) {
        $.ajax({
            url: `${baseUrl}/api/Item/${itemId}`,
            type: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            success: function () {
                alert('Item deleted successfully');
                loadItems(); // Refresh items list after deletion
            },
            error: function (xhr) {
                if (xhr.status === 404) {
                    alert('Item not found');
                } else {
                    alert('Failed to delete item');
                }
            }
        });
    }
}
