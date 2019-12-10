/// <reference path='sample_templates.g.ts' />

class TodoListView extends TodoListView_d {
    constructor(parent: HTMLElement) {
        super(g_jul8, parent);
    }

    // 로컬 스토리지에 저장할 데이터를 준비한다
    serialize(): TodoItem[] {
        var result: TodoItem[] = [];

        var list = this.listOf_TodoItemControl;
        list.forEach((control: TodoListView_TodoItemControl_d) => {
            if (!(control instanceof TodoItemControl)) { return; }
            let todoItemControl = control as TodoItemControl;

            let item = todoItemControl.get();
            if (!item.completed)
            {
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

    addNewItem(text: string) {
        let list = this.listOf_TodoItemControl;

        let data = { completed: false, text: text };
        let newControl = new TodoItemControl(data, this);
        list.insert(newControl, list.length() - 1);
    }
}