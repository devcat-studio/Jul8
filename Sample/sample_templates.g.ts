/// <reference path='../Library/TemplateHolder.ts' />
/// <reference path='../Library/jquery.d.ts' />

class MyTable_d
{
    tmpl: Jul8.TemplateInstance;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        let t = templateHolder.create('MyTable');
        this.tmpl = t;
        if (parentNode) { parentNode.append(t.root()); }
    }
}

class MyTable_TR_d
{
    tmpl: Jul8.TemplateInstance;
    NUM: JQuery;
    ALIAS: JQuery;
    IP: JQuery;
    VGSNAME: JQuery;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        let t = templateHolder.create('MyTable_TR');
        this.tmpl = t;
        if (parentNode) { parentNode.append(t.root()); }
        this.NUM = t.C('NUM');
        this.ALIAS = t.C('ALIAS');
        this.IP = t.C('IP');
        this.VGSNAME = t.C('VGSNAME');
    }
}

class MyButton_d
{
    tmpl: Jul8.TemplateInstance;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        let t = templateHolder.create('MyButton');
        this.tmpl = t;
        if (parentNode) { parentNode.append(t.root()); }
    }
}
