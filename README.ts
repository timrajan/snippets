const i = myDivContainer.querySelectorAll(".template-row").length;
clone.querySelectorAll("input, select").forEach(el => {
    el.value = "";
    if (el.name) el.name = el.name.replace(/\[\d+\]/, `[${i}]`);
    if (el.id)   el.id   = el.id.replace(/_\d+__/, `_${i}__`);
});
clone.querySelectorAll("[data-valmsg-for]").forEach(s =>
    s.setAttribute("data-valmsg-for", s.getAttribute("data-valmsg-for").replace(/\[\d+\]/, `[${i}]`)));

const form = $(myDivContainer.closest("form"));
form.removeData("validator").removeData("unobtrusiveValidation");
$.validator.unobtrusive.parse(form);
