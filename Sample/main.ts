/// <reference path='sample_templates.g.ts' />

type TodoItem = {
    completed: boolean;
    text: string;
}

class TodoListView extends TodoListView_d {
    constructor(parent: JQuery) {
        super(g_jul8, parent);
    }

    //데이터가 너무 길어지면 textarea의 높이를 변경한다
    resizeInput(element: JQuery) :void {
        var h = element.prop("scrollHeight") - parseFloat(element.css("padding-top")) * 2;
        element.height(h);
    }

    // 로컬 스토리지에 저장할 데이터를 준비한다
    serialize(): Array<TodoItem> {
        var result: Array<TodoItem> = new Array<TodoItem>();

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
            this.resizeInput(control.input);
            if (item.completed) {
                control.input.addClass("checked");
            }
            else {
                control.input.removeClass("checked");
            }
        }
        
        // 마지막 항목은 '새 항목 추가' 이다.
        // 컨트롤 클래스도 다른 것을 사용함.
        var lastOne = new LastTodoItemControl(this);
        lastOne.input.attr('placeholder', '새 항목 추가');

        lastOne.input
        .on("input", () => {
            this.resizeInput(lastOne.input);
        })
        .keydown((event) => {
            var code = event.keyCode || event.which;
            if (code == 13) {
                lastOne.input.trigger("blur");
            }
        })
        .focusout(() => {
            var newControl = new TodoItemControl(item, this);

            if (lastOne.input.val() != "") {
                list.insert(newControl, list.length() - 1);

                var t = { completed: false, text: String(lastOne.input.val()) };
                newControl.set(t);
                lastOne.input.val("");
                lastOne.input.removeAttr("style");

                this.writeStorage();
            }
        });
        list.add(lastOne);
    }
}

class TodoItemControl extends TodoListView_TodoItemControl_d {
    private data: TodoItem;

    constructor(data: TodoItem, parent: TodoListView) {
        super(data, parent);
        this.setEditingMode(false);
     
        // 이벤트 핸들링: 포커스되면 편집을 시작한다
        this.input
        .focusin(() => {
            this.setEditingMode(true);
        })
        .on("input", () =>{
            parent.resizeInput(this.input);
        })
        .keydown((event) => {
            var code = event.keyCode || event.which;
            if (code == 13) {
                this.input.trigger("focusout");
            }
        })
        // 이벤트 핸들링: 포커스 빠지면 편집을 마친다
        .focusout(() => {
            this.writeList(this);
        });

        // 이벤트 핸들링: 체크박스 값 확인
        this.completed.change(() => {
            this.writeList(this);

            if (this.completed.prop("checked")) {
                this.input.addClass("checked");
            }
            else {
                this.input.removeClass("checked");
            }
        });
    }

    set(data: TodoItem): void {
        super.set(data);
        this.data = data;

        this.completed.prop("checked", data.completed);

        todoListView.resizeInput(this.input);
    }

    get(): TodoItem {
        return this.data;
    }

    setEditingMode(on: boolean): void {
        if (on) {
            this.input.removeAttr('readonly');
        }
        else {
            this.input.attr('readonly', '');
        }
    }

    // 편집 종료
    writeList(control: TodoItemControl): void {
        var list = todoListView.listOf_TodoItemControl;

        control.setEditingMode(false);
        control.data.text = String(control.input.val());
        control.data.completed = control.completed.prop("checked");

        // 텍스트가 공란이면 해당 리스트를 지워준다
        if (control.data.text == "") {
            list.remove(control);
        }

        control.set(control.data);
        todoListView.writeStorage();
    }
}

class LastTodoItemControl extends TodoListView_TodoItemControl_d {
    constructor(parent: TodoListView) {
        super({ completed: false, text: "" }, parent);
        this.completed.remove();
    }
}

//-------------------------------------------------------
let g_jul8: Jul8.TemplateHolder;
let todoListView: TodoListView;

$(document).ready(
    () => {
        g_jul8 = new Jul8.TemplateHolder();
        g_jul8.addTemplateRoot($("#TEMPLATE_HOLDER_ROOT"));
        let parent = $("#PANEL_BODY");

        todoListView = new TodoListView(parent);
        todoListView.loadStorage();
    });