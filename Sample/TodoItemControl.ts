/// <reference path='sample_templates.g.ts' />

class TodoItemControl extends TodoListView_TodoItemControl_d {
    private data: TodoItem;
    private parent: TodoListView;

    constructor(data: TodoItem, parent: TodoListView) {
        super(data, parent);
        this.parent = parent;
        this.makeInputReadonly();
     
        // 이벤트 핸들링: 포커스되면 편집을 시작한다
        $(this.input)
            .focusin(() => {
                this.makeInputEditable();
            })
            .on("input", () =>{
                TodoItemControl.resizeInput($(this.input));
            })
            .keydown((event) => {
                var code = event.keyCode || event.which;
                if (code == 13) {
                    $(this.input).trigger("focusout");
                }
            })
            // 이벤트 핸들링: 포커스 빠지면 편집을 마친다
            .focusout(() => {
                this.endEditing();
            });

            // 이벤트 핸들링: 체크박스 값 확인
            $(this.completed).change(() => {
                this.endEditing();
            });
    }

    set(data: TodoItem): void {
        super.set(data);
        this.data = data;

        $(this.completed).prop("checked", data.completed);
        this.applyCompletionToInput();

        TodoItemControl.resizeInput($(this.input));
    }

    get(): TodoItem {
        return this.data;
    }

    makeInputReadonly(): void {
        $(this.input).attr('readonly', '');
    }

    makeInputEditable(): void {
        $(this.input).removeAttr('readonly');
    }

    applyCompletionToInput(): void {
        if (this.data.completed) {
            $(this.input).addClass("checked");
        }
        else {
            $(this.input).removeClass("checked");
        }
    }

    endEditing(): void {
        var list = this.parent.listOf_TodoItemControl;

        this.makeInputReadonly();
        this.applyCompletionToInput();
        this.data.text = String($(this.input).val());
        this.data.completed = $(this.completed).prop("checked");

        // 텍스트가 공란이면 해당 리스트를 지워준다
        if (this.data.text == "") {
            list.remove(this);
        }

        this.set(this.data);
        this.parent.writeStorage();
    }

    // 데이터가 너무 길어지면 textarea의 높이를 변경한다
    static resizeInput(element: JQuery): void {
        var h = element.prop("scrollHeight") - parseFloat(element.css("padding-top")) * 2;
        element.height(h);
    }
}
