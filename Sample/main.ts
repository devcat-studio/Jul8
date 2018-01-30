/// <reference path='sample_templates.g.ts' />

let pattern = /({{[^}]+}})/g;

function replace(text: string, data: any): string {
    if (text.search(pattern) < 0) {
        return undefined;
    }

    let list = text.split(pattern);
    for (let i = 0; i < list.length; ++i) {
        let word = list[i]
        if (word.startsWith("{{") && word.endsWith("}}")) {
            let fname = word.substr(2, word.length - 4).trim();
            if (data[fname] !== undefined) {
                list[i] = data[fname];
            } else {
                console.log('(Jul8) field not found: [' + fname + ']')
            }
        }
    }
    return list.join('');
}

function visitElem(elem: Element, data: any) {
    let childNodes = elem.children;
    if (childNodes.length > 0) {
        for (let i = 0; i < childNodes.length; ++i) {
            visitElem(childNodes[i], data)
        }
    }
    else {
        let alt = replace(elem.textContent, data)
        if (alt !== undefined) {
            elem.textContent = alt
        }
    }

    for (let i = 0; i < elem.attributes.length; ++i) {
        let attr = elem.attributes[i];
        let alt = replace(attr.value, data);
        if (alt !== undefined) {
            attr.value = alt;
        }
    }
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
        visitElem(tr.$.get(0), { num: n, color: 'red' });
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
        addBtn.$.text("새 항목 추가!")

        let myTable = new MyTable(parent);
        addBtn.$.click(() => myTable.addNewItem());

        myTable.addNewItem();
        myTable.addNewItem();
        myTable.addNewItem();
        myTable.addNewItem();
    });