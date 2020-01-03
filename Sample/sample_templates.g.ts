/// <reference path='../jul8/runtime/jul8.ts' />

class TodoListView_d implements Jul8.View
{
    root: HTMLElement;
    listOf_TodoItemControl: Jul8.ViewList<TodoListView_TodoItemControl_d>;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: HTMLElement)
    {
        this.root = templateHolder.cloneTemplate('TodoListView');
        if (parentNode) { parentNode.append(this.root); }
        let s = new Jul8.Scanner(this.root, false);
        this.listOf_TodoItemControl = s.L<TodoListView_TodoItemControl_d>('TodoItemControl');
    }
}

class TodoListView_TodoItemControl_d implements Jul8.View
{
    _parent: TodoListView_d;
    root: HTMLElement;
    completed: HTMLInputElement;
    input: HTMLTextAreaElement;
    
    constructor(data: TodoItem, parent: TodoListView_d)
    {
        this._parent = parent;
        this.root = parent.listOf_TodoItemControl._cloneTemplate();
        let s = new Jul8.Scanner(this.root, true);
        this.j8fields = s.fields;
        this.completed = s.C('completed');
        this.input = s.C('input');
        if (data) { this.set(data); }
    }
    
    private j8fields: Jul8.Fields;
    set(data: TodoItem): void
    {
        data.text;
        this.j8fields.set(data);
    }
}

class TEST_Template1_d implements Jul8.View
{
    root: HTMLElement;
    
    constructor(data: TEST_Model, templateHolder: Jul8.TemplateHolder, parentNode?: HTMLElement)
    {
        this.root = templateHolder.cloneTemplate('TEST_Template1');
        if (parentNode) { parentNode.append(this.root); }
        let s = new Jul8.Scanner(this.root, true);
        this.j8fields = s.fields;
        if (data) { this.set(data); }
    }
    
    private j8fields: Jul8.Fields;
    set(data: TEST_Model): void
    {
        data.field;
        this.j8fields.set(data);
    }
}

class TEST_Template2_d implements Jul8.View
{
    root: HTMLElement;
    Control: HTMLDivElement;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: HTMLElement)
    {
        this.root = templateHolder.cloneTemplate('TEST_Template2');
        if (parentNode) { parentNode.append(this.root); }
        let s = new Jul8.Scanner(this.root, false);
        this.Control = s.C('Control');
    }
}

class TEST_Template3_d implements Jul8.View
{
    root: HTMLElement;
    listOf_TEST_ListItem: Jul8.ViewList<TEST_Template3_TEST_ListItem_d>;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: HTMLElement)
    {
        this.root = templateHolder.cloneTemplate('TEST_Template3');
        if (parentNode) { parentNode.append(this.root); }
        let s = new Jul8.Scanner(this.root, false);
        this.listOf_TEST_ListItem = s.L<TEST_Template3_TEST_ListItem_d>('TEST_ListItem');
    }
}

class TEST_Template3_TEST_ListItem_d implements Jul8.View
{
    _parent: TEST_Template3_d;
    root: HTMLElement;
    
    constructor(data: TEST_Model, parent: TEST_Template3_d)
    {
        this._parent = parent;
        this.root = parent.listOf_TEST_ListItem._cloneTemplate();
        let s = new Jul8.Scanner(this.root, true);
        this.j8fields = s.fields;
        if (data) { this.set(data); }
    }
    
    private j8fields: Jul8.Fields;
    set(data: TEST_Model): void
    {
        data.field;
        this.j8fields.set(data);
    }
}

class TEST_Template4_d implements Jul8.View
{
    root: HTMLElement;
    listOf_TEST_ListItem: Jul8.ViewList<TEST_Template4_TEST_ListItem_d>;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: HTMLElement)
    {
        this.root = templateHolder.cloneTemplate('TEST_Template4');
        if (parentNode) { parentNode.append(this.root); }
        let s = new Jul8.Scanner(this.root, false);
        this.listOf_TEST_ListItem = s.L<TEST_Template4_TEST_ListItem_d>('TEST_ListItem');
    }
}

class TEST_Template4_TEST_ListItem_d implements Jul8.View
{
    _parent: TEST_Template4_d;
    root: HTMLElement;
    Control: HTMLDivElement;
    
    constructor(parent: TEST_Template4_d)
    {
        this._parent = parent;
        this.root = parent.listOf_TEST_ListItem._cloneTemplate();
        let s = new Jul8.Scanner(this.root, false);
        this.Control = s.C('Control');
    }
}
