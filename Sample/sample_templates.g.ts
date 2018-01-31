/// <reference path='../Library/jul8.ts' />
/// <reference path='../Library/jquery.d.ts' />

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
    inNum: JQuery;
    btnReflect: JQuery;
    btnRemove: JQuery;
    
    constructor($: JQuery)
    {
        this.$ = $;
        let s = new Jul8.Scanner(this.$, true);
        this.j8fields = s.fields;
        this.inNum = s.C('inNum');
        this.btnReflect = s.C('btnReflect');
        this.btnRemove = s.C('btnRemove');
    }
    
    private j8fields: Jul8.Fields;
    set(data: SampleData): void
    {
        data.num;
        data.inNum;
        this.j8fields.set(data);
    }
}

class Button_d implements Jul8.View
{
    $: JQuery;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        this.$ = templateHolder.cloneTemplate('Button');
        if (parentNode) { parentNode.append(this.$); }
        let s = new Jul8.Scanner(this.$, true);
        this.j8fields = s.fields;
    }
    
    private j8fields: Jul8.Fields;
    set(data: ButtonDesc): void
    {
        data.caption;
        this.j8fields.set(data);
    }
}
