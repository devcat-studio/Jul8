/// <reference path='sample_templates.g.ts' />

class TodoItemControl extends TodoListView_TodoItemControl_d {
    private data: TodoItem;
    private parent: TodoListView;

    constructor(data: TodoItem, parent: TodoListView) {
        super(data, g_jul8);
        this.parent = parent;
        this.makeInputReadonly();
     
        // 이벤트 핸들링: 포커스되면 편집을 시작한다
        this.input.addEventListener("focus", () => {
            this.makeInputEditable();
        });
        this.input.addEventListener("input", () =>{
            TodoItemControl.resizeInput(this.input);
        });
        this.input.addEventListener("keydown", (event) => {
            var code = event.keyCode || event.which;
            if (code == 13) {
                this.input.blur();
            }
        }); 
        // 이벤트 핸들링: 포커스 빠지면 편집을 마친다
        this.input.addEventListener("blur", () => {
            this.endEditing();
        });

        // 이벤트 핸들링: 체크박스 값 확인
        this.completed.addEventListener("change", () => {
            this.endEditing();
        });
    }

    set(data: TodoItem): void {
        super.set(data);
        this.data = data;

        this.completed.checked = data.completed;
        this.applyCompletionToInput();

        TodoItemControl.resizeInput(this.input);
    }

    get(): TodoItem {
        return this.data;
    }

    makeInputReadonly(): void {
        this.input.setAttribute("readonly", "");
    }

    makeInputEditable(): void {
        this.input.removeAttribute("readonly");
    }

    applyCompletionToInput(): void {
        if (this.data.completed) {
            this.input.classList.add("checked");
        }
        else {
            this.input.classList.remove("checked");
        }
    }

    endEditing(): void {
        var list = this.parent.listOf_TodoItemControl;

        this.makeInputReadonly();
        this.applyCompletionToInput();
        this.data.text = String(this.input.value);
        this.data.completed = this.completed.checked;

        // 텍스트가 공란이면 해당 리스트를 지워준다
        if (this.data.text == "") {
            list.remove(this);
        }

        this.set(this.data);
        this.parent.writeStorage();
    }

    // 데이터가 너무 길어지면 textarea의 높이를 변경한다
    static resizeInput(element: HTMLTextAreaElement): void {

        var h = element.scrollHeight - parseFloat(element.style.paddingTop) * 2;
        element.style.height = (h + "px");
    }
}
