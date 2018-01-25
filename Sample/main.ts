/// <reference path='sample_templates.g.ts' />

// 상속해서 만든 예제. 굳이 상속하지 않아도 상관없다.
class MyTable extends MyTable_d {
    count: number = 0;

    constructor(parent: JQuery) {
        super(g_jul8, parent);
    }

    addNewItem(): void {
        var tr = this.addTR();
        tr.num.text(++this.count);
        tr.content.text("칸은 만들었는데 딱히 쓸 말이 없는 " + this.count + "번째 행");
        tr.btnRemove.click(() => this.removeTR(tr));
    }
}

let g_jul8: Jul8.TemplateHolder;

$(document).ready(
    () => {
        g_jul8 = new Jul8.TemplateHolder($('#TEMPLATE_HOLDER_ROOT'));

        let parent = $('#PANEL_BODY');
        let addBtn = new Button_d(g_jul8, parent);
        addBtn.$.text("새 항목 추가!")

        let myTable = new MyTable(parent);
        addBtn.$.click(() => myTable.addNewItem());
    });