namespace Jul8 {
    export interface View {
        $: JQuery;
    }

    export class ViewList<T extends View> {
        private root: JQuery;
        private tmpl: JQuery;
        private list: T[] = [];

        constructor($: JQuery, tmpl: JQuery) {
            this.root = $;
            this.tmpl = tmpl;
        }

        add(type: { new(t: JQuery): T }): T {
            let newNode = this.tmpl.clone();
            let child = new type(newNode);
            this.list.push(child);
            this.root.append(newNode);
            return child;
        }

        remove(child: T): void {
            let idx = this.list.indexOf(child);
            if (idx >= 0) {
                this.list.splice(idx, 1);
                child.$.remove();
            }
        }

        forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void
        {
            this.list.forEach(callbackfn, thisArg);
        }
    }

    let pattern = /({{[^}]+}})/g;

    export class Fields {
        attrs: { attr: Attr, origValue: string }[] = [];
        elems: { elem: Element, origText: string }[] = [];

        set(data: any): void {
            for (let a of this.attrs) {
                var newValue = this.replace(a.origValue, data);
                if (a.attr.value !== newValue) {
                    a.attr.value = newValue;
                }
            }
            for (let e of this.elems) {
                var newText = this.replace(e.origText, data);
                if (e.elem.textContent !== newText) {
                    e.elem.textContent = newText;
                }
            }
        }

        private replace(text: string, data: any): string {
            let list = text.split(pattern);
            for (let i = 0; i < list.length; ++i) {
                let word = list[i]
                if (word.startsWith("{{") && word.endsWith("}}")) {
                    let fname = word.substr(2, word.length - 4).trim();
                    if (data[fname] !== undefined) {
                        list[i] = data[fname];
                    } else {
                        console.error('(Jul8) field not found: [' + fname + ']')
                    }
                }
            }
            return list.join('');
        }
    };

    export class Scanner {
        controls: { [key: string]: JQuery } = {};
        lists: { [key: string]: { list: JQuery, itemTemplate: JQuery } } = {};
        fields: Fields;

        constructor(root: JQuery, scanFields: boolean) {
            // 리스트 항목은 부모로부터 뗀다.
            // 그래야 처음에는 없고, 추가하는 만큼 붙일 수 있으니까.
            root.find('[j8-listItem]').each(
                (i, v) => {
                    let itemId = v.getAttribute('j8-listItem');

                    if (this.lists[itemId]) {
                        console.error('(Jul8) duplicate listItem id: [' + itemId + ']')
                    }

                    let j = $(v);
                    let p = j.parent();
                    j.detach();
                    this.lists[itemId] = { list: p, itemTemplate: j };
                });

            // 템플릿과 다르게 컨트롤들은 부모로부터 떼지 않는다.
            // 이미 템플릿 단위로 복제 생성된 상태이기 때문.
            root.find('[j8-control]').each(
                (i, v) => {
                    let cid = v.getAttribute('j8-control');

                    if (this.controls[cid]) {
                        console.error('(Jul8) duplicate control id: [' + cid + ']')
                    }
                    this.controls[cid] = $(v);
                });

            if (scanFields) {
                this.fields = new Fields();
                this.visitElem(root.get(0));
            }
        }

        private visitElem(elem: Element) {
            let childNodes = elem.children;
            if (childNodes.length > 0) {
                for (let i = 0; i < childNodes.length; ++i) {
                    this.visitElem(childNodes[i])
                }
            }
            else {
                if (elem.textContent.search(pattern) >= 0) {
                    let e = { elem: elem, origText: elem.textContent };
                    this.fields.elems.push(e);
                }
            }

            for (let i = 0; i < elem.attributes.length; ++i) {
                let attr = elem.attributes[i];
                if (attr.value.search(pattern) >= 0) {
                    let a = { attr: attr, origValue: attr.value };
                    this.fields.attrs.push(a);
                }
            }
        }

        C(controlId: string): JQuery {
            let ctl = this.controls[controlId];
            if (ctl === undefined) {
                console.error('(Jul8) no such control: [' + controlId + ']');
            }
            return ctl;
        }

        L<T extends View>(listItemId: string): ViewList<T> {
            let it = this.lists[listItemId];
            if (it === undefined) {
                console.error('(Jul8) no such listItem: [' + listItemId + ']');
            }
            return new ViewList<T>(it.list, it.itemTemplate);
        }
    }

    export class TemplateHolder {
        private templates: { [key: string]: JQuery } = {};

        constructor() { }

        addTemplateString(content: string): void {
            let beginMarker = '$(TemplateBegin)'
            let endMarker = '$(TemplateEnd)'
            let beginPos = content.indexOf(beginMarker);
            let endPos = content.indexOf(endMarker);
            let contentBody = content.substring(beginPos + beginMarker.length, endPos);

            this.addTemplateRoot($(contentBody));
        }

        addTemplateRoot(root: JQuery): void {
            root.find('[j8-template]').each(
                (i, v) => {
                    let j = $(v);
                    j.detach();
                    let tid = v.getAttribute('j8-template');
                    this.templates[tid] = j;
                });
        }

        cloneTemplate(templateId: string): JQuery {
            let t = this.templates[templateId];
            if (t === undefined) {
                console.error('(Jul8) no such template: [' + templateId + ']');
            }
            return t.clone();
        }
    }
}
