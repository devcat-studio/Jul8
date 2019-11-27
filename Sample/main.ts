/// <reference path='TodoListView.ts' />

//-------------------------------------------------------
let g_jul8: Jul8.TemplateHolder;

$(document).ready(
    () => {
        g_jul8 = new Jul8.TemplateHolder();
        g_jul8.addTemplateRoot($("#TEMPLATE_HOLDER_ROOT"));
        let parent = $("#PANEL_BODY");

        let todoListView = new TodoListView(parent);
        todoListView.loadStorage();
    });