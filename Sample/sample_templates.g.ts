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
