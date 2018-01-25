$(document).ready(
    () => {
        let panelBody = $('#PANEL_BODY');

        let templateHolder = new Jul8.TemplateHolder($('#TEMPLATE_HOLDER_ROOT'));

        let myTable = new MyTable_d(templateHolder, panelBody);

        for (let i = 0; i < 10; ++i)
        {
            var tr = myTable.addTR();
            tr.ALIAS.text("alias");
        }

        let addBtn = new Button_d(templateHolder, panelBody);
        addBtn._T_.root().text("새 항목 추가");
        
    });