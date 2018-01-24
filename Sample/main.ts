$(document).ready(
    () => {
        let panelBody = $('#PANEL_BODY');

        let templateHolder = new Jul8.TemplateHolder($('#TEMPLATE_HOLDER_ROOT'));

        var myTable = new MyTable_d(templateHolder, panelBody);
    });