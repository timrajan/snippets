  cursor: pointer;
        user-select: none;
        position: relative;
    }

    .results-table th:hover {
        background-color: #e8e8e8;
    }

    .results-table th.sortable::after {
        content: ' ⇅';
        opacity: 0.3;
        margin-left: 8px;
    }

    .results-table th.sort-asc::after {
        content: ' ↑';
        opacity: 1;
    }

    .results-table th.sort-desc::after {
        content: ' ↓';
        opacity: 1;
