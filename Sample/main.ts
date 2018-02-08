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

        tr.btnReflect.click(() => {
            let v = tr.inNum.val();
            tr.set({ num: v, inNum: v });
        });

        tr.listOf_Tag.add(MyTable_TR_Tag_d).$.text('Tag1');
        tr.listOf_Tag.add(MyTable_TR_Tag_d).$.text('Tag2');
        tr.listOf_Tag.add(MyTable_TR_Tag_d).$.text('Tag3');
    }

    summarize(): string {
        let rv = this.listOf_TR.length + '개의 항목이 있습니다.';

        rv += 'forEach로 순회: [ ';
        this.listOf_TR.forEach((v, i) => {
            rv += v.num.text() + ' ';
        });
        rv += '] getAt으로 순회: [ ';
        for (let i = 0; i < this.listOf_TR.length; ++i) {
            rv += this.listOf_TR.getAt(i).num.text() + ' ';
        }
        rv += ']';

        return rv;
    }
}

//-------------------------------------------------------
let g_jul8: Jul8.TemplateHolder;

$(document).ready(
    () => {
        g_jul8 = new Jul8.TemplateHolder();
        g_jul8.addTemplateRoot($('#TEMPLATE_HOLDER_ROOT'));

        let parent = $('#PANEL_BODY');

        let buttons = new Buttons_d(g_jul8, parent);

        buttons.add.click(() => {
            myTable.addNewItem();
            buttons.summary.text(myTable.summarize());
        });

        buttons.removeAt.click(() => {
            let idx = parseInt(buttons.removeIdx.val());
            myTable.listOf_TR.removeAt(idx);
            buttons.summary.text(myTable.summarize());
        });

        buttons.empty.click(() => {
            myTable.listOf_TR.empty();
            buttons.summary.text(myTable.summarize());
        });

        let myTable = new MyTable(parent);
        myTable.addNewItem();
        myTable.addNewItem();
        myTable.addNewItem();
        myTable.addNewItem();
        buttons.summary.text(myTable.summarize());
    });