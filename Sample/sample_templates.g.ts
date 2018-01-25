/// <reference path='../Library/jul8.ts' />
/// <reference path='../Library/jquery.d.ts' />

class MyTable_d
{
    tmpl: Jul8.TemplateInstance;
    listOfTR: MyTable_TR_d[] = [];
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        let t = templateHolder.create('MyTable');
        if (parentNode) { parentNode.append(t.root()); }
        this.tmpl = t;
    }
    
    addTR(): MyTable_TR_d
    {
        let t = this.tmpl.addListItem('TR');
        let child = new MyTable_TR_d(t);
        this.listOfTR.push(child);
        return child;
    }
    
    removeTR(child: MyTable_TR_d): void
    {
        let idx = this.listOfTR.indexOf(child);
        if (idx >= 0)
        {
            this.listOfTR.splice(idx, 1);
            child.tmpl.root().remove();
        }
    }
}

class MyTable_TR_d
{
    tmpl: Jul8.TemplateInstance;
    NUM: JQuery;
    ALIAS: JQuery;
    IP: JQuery;
    VGSNAME: JQuery;
    
    constructor(t: Jul8.TemplateInstance)
    {
        this.tmpl = t;
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
        if (parentNode) { parentNode.append(t.root()); }
        this.tmpl = t;
    }
}
