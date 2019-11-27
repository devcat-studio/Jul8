/// <reference path='sample_templates.g.ts' />

type TodoItem = {
    completed: boolean;
    text: string;
}

class TodoListView extends TodoListView_d {
    constructor(parent: JQuery) {
        super(g_jul8, parent);
    }

    // 로컬 스토리지에 저장할 데이터를 준비한다
    serialize(): TodoItem[] {
        var result: TodoItem[] = [];

        var list = this.listOf_TodoItemControl;
        list.forEach((control: TodoListView_TodoItemControl_d) => {
            if ( control instanceof TodoItemControl )
            {
                let todoItemControl = control as TodoItemControl;
                //console.log(todoItemControl);

                let item = todoItemControl.get();
                if ( item.completed == true )
                {
                    return;
                }
                result.push(item);
            }
        });

        return result;
    }

    // 저장
    writeStorage(): void {
        var storage = window.localStorage;
        let result = this.serialize();
        //console.log(result);
        storage.setItem("list", JSON.stringify(result));
    }

    // 화면 생성 시 보여줄 목록을 불러온다
    loadStorage(): void {
        var storage = window.localStorage;
        var list = JSON.parse(storage.getItem("list"));

        // 저장된 항목이 없거나 최초 접속 시
        if (list == null || list.length == 0) {
            list = [
                { completed: false, text: "처음부터 있는 첫번째 항목" },
                { completed: true, text: "처음부터 있는 두번째 항목" }
            ];
        }
        this.setItems(list);
        this.writeStorage();
    }

    setItems(items: TodoItem[]): void {
        var list = this.listOf_TodoItemControl;

        // 외부에서 주어진 초기 데이터로 리스트를 채움
        for (var item of items) {
            var control = new TodoItemControl(item, this);
            list.add(control);
            // list.add된 이후에 정확한 높이값을 알 수 있으므로
            // 중복 호출 같지만 피할 수 없다.
            TodoItemControl.resizeInput(control.input);
        }
        
        // 마지막 항목은 '새 항목 추가' 이다.
        // 컨트롤 클래스도 다른 것을 사용함.
        var lastOne = new LastTodoItemControl(this);
        list.add(lastOne);
    }
}

class TodoItemControl extends TodoListView_TodoItemControl_d {
    private data: TodoItem;
    private parent: TodoListView;

    constructor(data: TodoItem, parent: TodoListView) {
        super(data, parent);
        this.parent = parent;
        this.makeInputReadonly();
     
        // 이벤트 핸들링: 포커스되면 편집을 시작한다
        this.input
            .focusin(() => {
                this.makeInputEditable();
            })
            .on("input", () =>{
                TodoItemControl.resizeInput(this.input);
            })
            .keydown((event) => {
                var code = event.keyCode || event.which;
                if (code == 13) {
                    this.input.trigger("focusout");
                }
            })
            // 이벤트 핸들링: 포커스 빠지면 편집을 마친다
            .focusout(() => {
                this.endEditing();
            });

            // 이벤트 핸들링: 체크박스 값 확인
            this.completed.change(() => {
                this.endEditing();
            });
    }

    set(data: TodoItem): void {
        super.set(data);
        this.data = data;

        this.completed.prop("checked", data.completed);
        this.applyCompletionToInput();

        TodoItemControl.resizeInput(this.input);
    }

    get(): TodoItem {
        return this.data;
    }

    makeInputReadonly(): void {
        this.input.attr('readonly', '');
    }

    makeInputEditable(): void {
        this.input.removeAttr('readonly');
    }

    applyCompletionToInput(): void {
        if (this.data.completed) {
            this.input.addClass("checked");
        }
        else {
            this.input.removeClass("checked");
        }
    }

    endEditing(): void {
        var list = this.parent.listOf_TodoItemControl;

        this.makeInputReadonly();
        this.applyCompletionToInput();
        this.data.text = String(this.input.val());
        this.data.completed = this.completed.prop("checked");

        // 텍스트가 공란이면 해당 리스트를 지워준다
        if (this.data.text == "") {
            list.remove(this);
        }

        this.set(this.data);
        this.parent.writeStorage();
    }

    //데이터가 너무 길어지면 textarea의 높이를 변경한다
    static resizeInput(element: JQuery): void {
        var h = element.prop("scrollHeight") - parseFloat(element.css("padding-top")) * 2;
        element.height(h);
    }
}

class LastTodoItemControl extends TodoListView_TodoItemControl_d {
    private parent: TodoListView;

    constructor(parent: TodoListView) {
        super({ completed: false, text: "" }, parent);
        this.parent = parent;
        this.completed.remove();
        this.input.attr('placeholder', '새 항목 추가');

        this.input
            .on("input", () => {
                TodoItemControl.resizeInput(this.input);
            })
            .keydown((event) => {
                var code = event.keyCode || event.which;
                if (code == 13) {
                    this.input.trigger("blur");
                }
            })
            .focusout(() => {
                if (this.input.val() != "") {
                    this.addNewControl(String(this.input.val()));

                    this.input.val("");
                    this.input.removeAttr("style"); // resizeInput의 효과를 제거하기 위해서
                    this.parent.writeStorage();
                }
            });
    }

    addNewControl(text: string) {
        let list = this.parent.listOf_TodoItemControl;

        let data = { completed: false, text: text };
        let newControl = new TodoItemControl(data, this.parent);
        list.insert(newControl, list.length() - 1);
    }
}

//-------------------------------------------------------
let g_jul8: Jul8.TemplateHolder;

$(document).ready(
    () => {
        g_jul8 = new Jul8.TemplateHolder();
        g_jul8.addTemplateRoot($("#TEMPLATE_HOLDER_ROOT"));
        let parent = $("#PANEL_BODY");

        let todoListView = new TodoListView(parent);
        todoListView.loadStorage();
    });