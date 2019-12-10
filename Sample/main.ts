/// <reference path='TodoListView.ts' />

//-------------------------------------------------------
let g_jul8: Jul8.TemplateHolder;

document.addEventListener("DOMContentLoaded", function() {
    const appRoot = document.getElementById("TEMPLATE_HOLDER_ROOT");
    g_jul8 = new Jul8.TemplateHolder();
    g_jul8.addTemplateRoot(appRoot);

    const parent = document.getElementById("PANEL_BODY");
    const todoListView = new TodoListView(parent);
    todoListView.loadStorage();
});