/// <reference path='sample_templates.g.ts' />

type SampleData = {
    num: number;
    inNum: number;
};

type ButtonDesc = {
    caption: string;
}

//-------------------------------------------------------
// 상속해서 만든 예제.
// 꼭 상속해서 만들어야만 하는 것은 아니다.
class MyTable extends MyTable_d {
    count: number = 0;

    constructor(parent: JQuery) {
        super(g_jul8, parent);
    }

    addNewItem(): void {
        // 이 예제에서는 굳이 상속을 사용하지 않음.
        // 리스트 아이템에서 상속을 사용하고 싶다면 아래와 같이 하면 된다.
        //var tr = <MyTable_TR>this.listOf_TR.add(MyTable_TR);

        var tr = this.listOf_TR.add(MyTable_TR_d);
        let n = ++this.count;

        // 덮어씌우기가 제대로 되는지 확인하기 위해 한 번 쓰레기값을 넣는다
        tr.set({ num: 0, inNum: 0 });

        tr.set({ num: n, inNum: n });

        tr.btnRemove.click(() => this.listOf_TR.remove(tr));
    }
}

//-------------------------------------------------------
let g_jul8: Jul8.TemplateHolder;

$(document).ready(
    () => {
        g_jul8 = new Jul8.TemplateHolder();
        g_jul8.addTemplateRoot($('#TEMPLATE_HOLDER_ROOT'));

        let parent = $('#PANEL_BODY');
        let addBtn = new Button_d(g_jul8, parent);
        addBtn.set({ caption: "새 항목 추가!" });

        let myTable = new MyTable(parent);
        addBtn.$.click(() => myTable.addNewItem());

        myTable.addNewItem();
        myTable.addNewItem();
        myTable.addNewItem();
        myTable.addNewItem();
    });