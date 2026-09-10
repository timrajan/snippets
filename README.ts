// row 0 has no minus button, so give the clone one
    if (!clone.querySelector('.remove-row')) {
        clone.insertAdjacentHTML('beforeend',
            '<button type="button" class="remove-row">−</button>');
    }
