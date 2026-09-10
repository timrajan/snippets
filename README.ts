@{
    var prefix = ViewData.TemplateInfo.HtmlFieldPrefix;
    var isFirst = prefix.EndsWith("[0]");
}


<div class="student-row">
    @Html.TextBoxFor(m => m.Name)
    @Html.TextBoxFor(m => m.Age)

    <button type="button" class="add-row">+</button>
    @if (!isFirst)
    {
        <button type="button" class="remove-row">−</button>
    }
</div>


const MAX_ROWS = 20;
const container = document.getElementById('studentContainer');

function refreshRowState() {
    const rows = container.querySelectorAll('.student-row');   // your row class
    const count = rows.length;

    rows.forEach(row => {
        const add = row.querySelector('.add-row');
        const remove = row.querySelector('.remove-row');
        if (add) add.disabled = count >= MAX_ROWS;
        if (remove) remove.disabled = count <= 1;
    });

    const msg = document.getElementById('rowLimitMsg');
    if (msg) msg.hidden = count < MAX_ROWS;
}


container.addEventListener('click', function (e) {
    if (e.target.classList.contains('add-row')) {
        if (container.querySelectorAll('.student-row').length >= MAX_ROWS) return;
        // ...your existing clone/append code...
        refreshRowState();
    }

    if (e.target.classList.contains('remove-row')) {
        e.target.closest('.student-row').remove();
        refreshRowState();
    }
});

document.addEventListener('DOMContentLoaded', refreshRowState);
