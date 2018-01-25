/// <reference path='../Library/jul8.ts' />
/// <reference path='../Library/jquery.d.ts' />

class MyTable_d implements Jul8.Element
{
    $: JQuery;
    listOf_TR: Jul8.ElementList<MyTable_TR_d>
    private tmpl: Jul8.TemplateInstance;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        let t = templateHolder.create('MyTable');
        if (parentNode) { parentNode.append(t.root()); }
        this.tmpl = t;
        this.$ = t.root();
        this.listOf_TR = new Jul8.ElementList<MyTable_TR_d>(t);
    }
}

class MyTable_TR_d implements Jul8.Element
{
    $: JQuery;
    num: JQuery;
    content: JQuery;
    btnRemove: JQuery;
    private tmpl: Jul8.TemplateInstance;
    
    constructor(t: Jul8.TemplateInstance)
    {
        this.tmpl = t;
        this.$ = t.root();
        this.num = t.C('num');
        this.content = t.C('content');
        this.btnRemove = t.C('btnRemove');
    }
}

class Button_d implements Jul8.Element
{
    $: JQuery;
    private tmpl: Jul8.TemplateInstance;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        let t = templateHolder.create('Button');
        if (parentNode) { parentNode.append(t.root()); }
        this.tmpl = t;
        this.$ = t.root();
    }
}
