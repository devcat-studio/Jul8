/// <reference path='TodoListView.ts' />

//-------------------------------------------------------
let g_jul8: Jul8.TemplateHolder;

$(document).ready(
    () => {
        g_jul8 = new Jul8.TemplateHolder();
        g_jul8.addTemplateRoot($("#TEMPLATE_HOLDER_ROOT").get(0));
        let parent = $("#PANEL_BODY").get(0);

        let todoListView = new TodoListView(parent);
        todoListView.loadStorage();
    });