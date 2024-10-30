function loadLogFiles(pageNumber = 1, pageSize = 10) {
    $.ajax({
        url: `${baseUrl}/api/Log/files?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function (response) {
            const tableBody = $('#logFilesTableBody');
            tableBody.empty();
            response.records.forEach(file => {
                tableBody.append(`
                    <tr>
                        <td>${file.fileName}</td>
                        <td>${new Date(file.lastModified).toLocaleString()}</td>
                        <td><button class="btn btn-primary" onclick="viewLogFile('${file.fileName}')">View</button></td>
                    </tr>
                `);
            });

            const totalPages = Math.ceil(response.totalFiles / response.pageSize);
            $('#pagination').html(`
                <button class="btn btn-secondary" id="prevPage" ${pageNumber === 1 ? 'disabled' : ''}>Previous</button>
                <span>Page ${pageNumber} of ${totalPages}</span>
                <button class="btn btn-secondary" id="nextPage" ${pageNumber === totalPages ? 'disabled' : ''}>Next</button>
            `);

            $('#nextPage').click(() => {
                if (pageNumber < totalPages) loadLogFiles(pageNumber + 1, pageSize);
            });
            $('#prevPage').click(() => {
                if (pageNumber > 1) loadLogFiles(pageNumber - 1, pageSize);
            });
        },
        error: function () {
            alert('Failed to load logs.');
        }
    });
}

function viewLogFile(fileName) {
    window.location.href = `log_viewer.html?fileName=${fileName}`;
}


const pageSize = 20;

function getQueryParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function loadLogFileContent(pageNumber = 1) {
    const fileName = getQueryParameter('fileName');
    if (!fileName) {
        alert("Log file name is missing in the URL.");
        return;
    }

    $('#logFileName').text(`Log Viewer - ${fileName}`);

    $.ajax({
        url: `${baseUrl}/api/Log/content`,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        data: { fileName, pageNumber, pageSize },
        success: function (response) {
            const logContent = $('#logContent');
            // Convert each line to HTML by joining with <br> tags
            logContent.html(response.records.map(line => `<div>${line}</div>`).join(''));

            const totalPages = Math.ceil(response.totalLines / pageSize);
            $('#pageInfo').text(`Page ${response.pageNumber} of ${totalPages}`);
            $('#prevPage').prop('disabled', pageNumber === 1);
            $('#nextPage').prop('disabled', pageNumber === totalPages);

            $('#prevPage').off('click').on('click', function () {
                if (pageNumber > 1) loadLogFileContent(pageNumber - 1);
            });

            $('#nextPage').off('click').on('click', function () {
                if (pageNumber < totalPages) loadLogFileContent(pageNumber + 1);
            });
        },
        error: function () {
            alert('Failed to load log file content');
        }
    });
}