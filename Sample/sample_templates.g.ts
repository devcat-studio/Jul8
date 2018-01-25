/// <reference path='../Library/jul8.ts' />
/// <reference path='../Library/jquery.d.ts' />

class MyTable_d implements Jul8.Element
{
    $: JQuery;
    listOf_TR: Jul8.ElementList<MyTable_TR_d>;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        this.$ = templateHolder.cloneTemplate('MyTable');
        if (parentNode) { parentNode.append(this.$); }
        let s = new Jul8.Scanner(this.$);
        this.listOf_TR = s.L<MyTable_TR_d>('TR');
    }
}

class MyTable_TR_d implements Jul8.Element
{
    $: JQuery;
    num: JQuery;
    content: JQuery;
    btnRemove: JQuery;
    
    constructor($: JQuery)
    {
        this.$ = $;
        let s = new Jul8.Scanner(this.$);
        this.num = s.C('num');
        this.content = s.C('content');
        this.btnRemove = s.C('btnRemove');
    }
}

class Button_d implements Jul8.Element
{
    $: JQuery;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        this.$ = templateHolder.cloneTemplate('Button');
        if (parentNode) { parentNode.append(this.$); }
        let s = new Jul8.Scanner(this.$);
    }
}
