/// <reference path='../Library/jul8.ts' />

class TodoListView_d implements Jul8.View
{
    $: JQuery;
    listOf_TodoItemControl: Jul8.ViewList<TodoListView_TodoItemControl_d>;
    
    constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)
    {
        this.$ = templateHolder.cloneTemplate('TodoListView');
        if (parentNode) { parentNode.append(this.$); }
        let s = new Jul8.Scanner(this.$, false);
        this.listOf_TodoItemControl = s.L<TodoListView_TodoItemControl_d>('TodoItemControl');
    }
}

class TodoListView_TodoItemControl_d implements Jul8.View
{
    _parent: TodoListView_d;
    $: JQuery;
    completed: JQuery;
    input: JQuery;
    
    constructor(data: TodoItem, parent: TodoListView_d)
    {
        this._parent = parent;
        this.$ = parent.listOf_TodoItemControl._cloneTemplate();
        let s = new Jul8.Scanner(this.$, true);
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
