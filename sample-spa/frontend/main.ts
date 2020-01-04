/// <reference path='../../jul8/runtime/jul8spa.ts' />

//-------------------------------------------------------
let g_jul8: Jul8.TemplateHolder;
let g_appRootNode: HTMLElement;

let pageScope = this;
let g_jul8spa = new Jul8SPA(pageScope);

function initializeTemplate() {
    g_appRootNode = document.getElementById("Root");

    g_jul8 = new Jul8.TemplateHolder();
    let templatesRoot = document.getElementById("TEMPLATES_ROOT");
    g_jul8.addTemplateRoot(templatesRoot);
    templatesRoot.parentNode.removeChild(templatesRoot);
}

