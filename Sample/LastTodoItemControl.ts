/// <reference path='sample_templates.g.ts' />

class LastTodoItemControl extends TodoListView_TodoItemControl_d {
    private parent: TodoListView;

    constructor(parent: TodoListView) {
        super({ completed: false, text: "" }, g_jul8);
        this.parent = parent;
        this.completed.remove();
        this.input.setAttribute("placeholder", "새 항목 추가");

        this.input.addEventListener("input", () => {
            TodoItemControl.resizeInput(this.input);
        });
        this.input.addEventListener("keydown", (event) => {
            var code = event.keyCode || event.which;
            if (code == 13) {
                this.input.blur();
            }
        });
        this.input.addEventListener("blur", () => {
            if (this.input.value != "") {
                this.parent.addNewItem(String(this.input.value));

                this.input.value = "";
                this.input.removeAttribute("style"); // resizeInput의 효과를 제거하기 위해서
                this.parent.writeStorage();
            }
        });
    }
}