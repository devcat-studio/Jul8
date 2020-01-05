/// <reference path='../../jul8/runtime/jul8.ts' />

class HomePage_d implements Jul8.View
{
    root: HTMLElement;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: HTMLElement)
    {
        this.root = templateHolder.cloneTemplate('HomePage');
        if (parentNode) { parentNode.append(this.root); }
        let s = new Jul8.Scanner(this.root, false);
    }
}

class ArticleTitleList_d implements Jul8.View
{
    root: HTMLElement;
    listOf_Item: Jul8.ViewList<ArticleTitleList_Item_d>;
    
    constructor(data: BoardViewData, templateHolder: Jul8.TemplateHolder, parentNode?: HTMLElement)
    {
        this.root = templateHolder.cloneTemplate('ArticleTitleList');
        if (parentNode) { parentNode.append(this.root); }
        let s = new Jul8.Scanner(this.root, true);
        this.j8fields = s.fields;
        this.listOf_Item = s.L<ArticleTitleList_Item_d>('Item');
        if (data) { this.set(data); }
    }
    
    private j8fields: Jul8.Fields;
    set(data: BoardViewData): void
    {
        data.name;
        data.link;
        this.j8fields.set(data);
    }
}

class ArticleTitleList_Item_d implements Jul8.View
{
    root: HTMLElement;
    
    constructor(data: ArticleListItemViewData, templateHolder: Jul8.TemplateHolder, parent?: ArticleTitleList_d)
    {
        this.root = templateHolder.cloneTemplate('ArticleTitleList_Item');
        if (parent) { parent.listOf_Item.add(this); }
        let s = new Jul8.Scanner(this.root, true);
        this.j8fields = s.fields;
        if (data) { this.set(data); }
    }
    
    private j8fields: Jul8.Fields;
    set(data: ArticleListItemViewData): void
    {
        data.title;
        data.link;
        this.j8fields.set(data);
    }
}

class ArticlePage_d implements Jul8.View
{
    root: HTMLElement;
    
    constructor(data: ArticleData, templateHolder: Jul8.TemplateHolder, parentNode?: HTMLElement)
    {
        this.root = templateHolder.cloneTemplate('ArticlePage');
        if (parentNode) { parentNode.append(this.root); }
        let s = new Jul8.Scanner(this.root, true);
        this.j8fields = s.fields;
        if (data) { this.set(data); }
    }
    
    private j8fields: Jul8.Fields;
    set(data: ArticleData): void
    {
        data.boardName;
        data.title;
        data.content;
        this.j8fields.set(data);
    }
}
