const addInClone = clone.querySelector('.btn-success');
if (!clone.querySelector('.remove-row')) {
    addInClone.insertAdjacentHTML('afterend',
        '<button type="button" class="btn btn-danger remove-row">−</button>');
}
