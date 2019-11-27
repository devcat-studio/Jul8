/// <reference path='sample_templates.g.ts' />

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
                    this.parent.addNewItem(String(this.input.val()));

                    this.input.val("");
                    this.input.removeAttr("style"); // resizeInput의 효과를 제거하기 위해서
                    this.parent.writeStorage();
                }
            });
    }
}