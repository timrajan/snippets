
    // Table sorting functionality
    let sortDirections = {}; // Track sort direction for each column

    function sortTable(columnIndex) {
        const table = document.getElementById('resultsTable');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const headers = table.querySelectorAll('th');

        // Toggle sort direction
        if (!sortDirections[columnIndex]) {
            sortDirections[columnIndex] = 'asc';
        } else if (sortDirections[columnIndex] === 'asc') {
            sortDirections[columnIndex] = 'desc';
        } else {
            sortDirections[columnIndex] = 'asc';
        }

        const direction = sortDirections[columnIndex];

        // Remove sort classes from all headers
        headers.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
        });

        // Add sort class to current header
        headers[columnIndex].classList.add(direction === 'asc' ? 'sort-asc' : 'sort-desc');

        // Sort rows
        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();

            if (direction === 'asc') {
                return aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
            } else {
                return bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
            }
        });

        // Re-append sorted rows
        rows.forEach(row => tbody.appendChild(row));
    }
