/// <reference path='../Library/TemplateHolder.ts' />
/// <reference path='../Library/jquery.d.ts' />

class MyTable_d
{
    root: JQuery;
    NUM: JQuery;
    ALIAS: JQuery;
    IP: JQuery;
    VGSNAME: JQuery;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        let t = templateHolder.create('MyTable');
        this.root = t.root();
        if (parentNode) { parentNode.append(this.root); }
        this.NUM = t.C('NUM');
        this.ALIAS = t.C('ALIAS');
        this.IP = t.C('IP');
        this.VGSNAME = t.C('VGSNAME');
    }
}
