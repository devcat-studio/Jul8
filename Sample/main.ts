/// <reference path='sample_templates.g.ts' />

type TodoItem = {
    completed: boolean;
    text: string;
}

class TodoListView extends TodoListView_d {
    constructor(parent: JQuery) {
        super(g_jul8, parent);
    }

    setItems(items: TodoItem[]): void {
        // 외부에서 주어진 초기 데이터로 리스트를 채움
        for (var item of items) {
            var control = this.listOf_TodoItemControl.add(TodoItemControl);
            control.set(item);
        }

        // 마지막 항목은 '새 항목 추가' 이다.
        // 컨트롤 클래스도 다른 것을 사용함.
        var lastOne = this.listOf_TodoItemControl.add(LastTodoItemControl);
        lastOne.text.click(() => {
            var pos = this.listOf_TodoItemControl.length() - 1;
            var newControl = this.listOf_TodoItemControl.insert(TodoItemControl, pos);
            newControl.set({ completed: false, text: "" });
            newControl.setEditingMode(true);
        });
    }
}

class TodoItemControl extends TodoListView_TodoItemControl_d {
    private data: TodoItem;

    constructor(parent: JQuery) {
        super(parent);
        this.setEditingMode(false);
     
        // 이벤트 핸들링: 클릭하면 편집을 시작한다
        this.text.click(() => {
            this.setEditingMode(true);
        });

        // 이벤트 핸들링: 포커스 빠지면 편집을 마친다
        this.input.blur(() => {
            this.setEditingMode(false);
            this.data.text = String(this.input.val());
            this.set(this.data);
        });
    }

    set(data: TodoItem): void {
        super.set(data);
        this.data = data;
    }

    setEditingMode(on: boolean): void {
        if (on) {
            this.text.hide();
            this.input.show();
            this.input.focus();
        }
        else {
            this.text.show();
            this.input.hide();
        }
    }
}

class LastTodoItemControl extends TodoListView_TodoItemControl_d {
    constructor(parent: JQuery) {
        super(parent);

        this.completed.hide();
        this.input.hide();
        this.text.text('새 항목 추가');
    }
}

//-------------------------------------------------------
let g_jul8: Jul8.TemplateHolder;

$(document).ready(
    () => {
        g_jul8 = new Jul8.TemplateHolder();
        g_jul8.addTemplateRoot($('#TEMPLATE_HOLDER_ROOT'));
        let parent = $('#PANEL_BODY');

        let todoListView = new TodoListView(parent);

        var testItems: TodoItem[] = [
            { completed: false, text: '처음부터 있는 첫번째 항목' },
            { completed: true, text: '처음부터 있는 두번째 항목' }
        ];
        todoListView.setItems(testItems);
    });