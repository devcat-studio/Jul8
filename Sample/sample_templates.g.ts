/// <reference path='../Library/jul8.ts' />
/// <reference path='../Library/jquery.d.ts' />

class Buttons_d implements Jul8.View
{
    $: JQuery;
    add: JQuery;
    removeIdx: JQuery;
    removeAt: JQuery;
    empty: JQuery;
    summary: JQuery;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        this.$ = templateHolder.cloneTemplate('Buttons');
        if (parentNode) { parentNode.append(this.$); }
        let s = new Jul8.Scanner(this.$, false);
        this.add = s.C('add');
        this.removeIdx = s.C('removeIdx');
        this.removeAt = s.C('removeAt');
        this.empty = s.C('empty');
        this.summary = s.C('summary');
    }
}

class MyTable_d implements Jul8.View
{
    $: JQuery;
    listOf_TR: Jul8.ViewList<MyTable_TR_d>;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        this.$ = templateHolder.cloneTemplate('MyTable');
        if (parentNode) { parentNode.append(this.$); }
        let s = new Jul8.Scanner(this.$, false);
        this.listOf_TR = s.L<MyTable_TR_d>('TR');
    }
}

class MyTable_TR_d implements Jul8.View
{
    $: JQuery;
    num: JQuery;
    inNum: JQuery;
    btnReflect: JQuery;
    btnRemove: JQuery;
    listOf_Tag: Jul8.ViewList<MyTable_TR_Tag_d>;
    
    constructor($: JQuery)
    {
        this.$ = $;
        let s = new Jul8.Scanner(this.$, true);
        this.j8fields = s.fields;
        this.num = s.C('num');
        this.inNum = s.C('inNum');
        this.btnReflect = s.C('btnReflect');
        this.btnRemove = s.C('btnRemove');
        this.listOf_Tag = s.L<MyTable_TR_Tag_d>('Tag');
    }
    
    private j8fields: Jul8.Fields;
    set(data: SampleData): void
    {
        data.num;
        data.inNum;
        this.j8fields.set(data);
    }
}

class MyTable_TR_Tag_d implements Jul8.View
{
    $: JQuery;
    
    constructor($: JQuery)
    {
        this.$ = $;
        let s = new Jul8.Scanner(this.$, false);
    }
}
