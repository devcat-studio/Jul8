/// <reference path='../Library/jul8.ts' />
/// <reference path='../Library/jquery.d.ts' />

class MyTable_d
{
    $: JQuery;
    
    private _T_: Jul8.TemplateInstance;
    private listOf_TR: MyTable_TR_d[] = [];
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        let t = templateHolder.create('MyTable');
        if (parentNode) { parentNode.append(t.root()); }
        this._T_ = t;
        this.$ = t.root();
    }
    
    addTR(): MyTable_TR_d
    {
        let t = this._T_.addListItem('TR');
        let child = new MyTable_TR_d(t);
        this.listOf_TR.push(child);
        return child;
    }
    
    removeTR(child: MyTable_TR_d): void
    {
        let idx = this.listOf_TR.indexOf(child);
        if (idx >= 0)
        {
            this.listOf_TR.splice(idx, 1);
            child.$.remove();
        }
    }
}

class MyTable_TR_d
{
    $: JQuery;
    NUM: JQuery;
    ALIAS: JQuery;
    IP: JQuery;
    VGSNAME: JQuery;
    
    private _T_: Jul8.TemplateInstance;
    
    constructor(t: Jul8.TemplateInstance)
    {
        this._T_ = t;
        this.$ = t.root();
        this.NUM = t.C('NUM');
        this.ALIAS = t.C('ALIAS');
        this.IP = t.C('IP');
        this.VGSNAME = t.C('VGSNAME');
    }
}

class Button_d
{
    $: JQuery;
    
    private _T_: Jul8.TemplateInstance;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        let t = templateHolder.create('Button');
        if (parentNode) { parentNode.append(t.root()); }
        this._T_ = t;
        this.$ = t.root();
    }
}
