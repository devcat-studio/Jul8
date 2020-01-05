namespace Jul8 {
    export interface View {
        root: HTMLElement;
    }

    export class ViewList<T extends View> {
        private root: HTMLElement;
        private list: T[] = [];

        constructor(root: HTMLElement) {
            this.root = root;
        }

        add<U extends T>(child: U): void {
            this.list.push(child);
            this.root.appendChild(child.root);
        }

        insert<U extends T>(child: U, index: number): void {
            this.list.splice(index, 0, child);
            if (index == 0) {
                this.root.insertBefore(child.root, this.root.firstChild);
            }
            else {
                this.list[index - 1].root.after(child.root);
            }
        }

        length(): number {
            return this.list.length;
        }

        remove(child: T): void {
            let idx = this.list.indexOf(child);
            if(idx >= 0) {
                this.list.splice(idx, 1);
                child.root.remove();
            }
        }

        removeAt(idx: number): void {
            if (idx < 0) {
                idx = this.list.length + idx;
            }
            let child = this.list[idx];
            this.list.splice(idx, 1);
            child.root.remove();
        }

        empty(): void {
            this.list = [];
            this.root.textContent = "";
        }

        getAt(idx: number): T {
            return this.list[idx];
        }

        forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
            this.list.forEach(callbackfn, thisArg);
        }
    }

    let pattern = /({{[^}]+}})/g;

    export class Fields {
        // elem과 replacedLocalName은 j8-attr-* 속성을 지원하는 용도이다.
        // 이들이 설정되어 있으면 아직 DOM에는 해당 attr이 설정되어 있지 않은 것이다.
        // 일단 attr이 설정된 뒤에는 그 Attr 노드를 직접 고치면 되므로 elem/replacedLocalName은 null이 된다.
        attrs: { attr: Attr, elem: Element, replacedLocalName: string, origValue: string }[] = [];
        nodes: { node: Node, origText: string }[] = [];

        set(data: any): void {
            for (let a of this.attrs) {
                let newValue = this.replace(a.origValue, data);
                if (a.replacedLocalName) {
                    if (a.attr.namespaceURI !== null) {
                        a.attr = document.createAttributeNS(a.attr.namespaceURI, a.replacedLocalName);
                        a.attr.value = newValue;
                        a.elem.setAttributeNodeNS(a.attr);
                    } else {
                        a.attr = document.createAttribute(a.replacedLocalName);
                        a.attr.value = newValue;
                        a.elem.setAttributeNode(a.attr);
                    }
                    a.elem = null;
                    a.replacedLocalName = null;
                } else {
                    if (a.attr.value !== newValue) {
                        a.attr.value = newValue;
                    }
                }
            }

            for (let e of this.nodes) {
                var newText = this.replace(e.origText, data);
                if (e.node.textContent !== newText) {
                    e.node.textContent = newText;
                }
            }
        }

        private replace(text: string, data: any): string {
            let list = text.split(pattern);
            for (let i = 0; i < list.length; ++i) {
                let word = list[i]
                if (word.substring(0, 2) === "{{" && word.substring(word.length - 2) === "}}") {
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
        controls: { [key: string]: HTMLElement } = {};
        listRootElems: { [key: string]: HTMLElement } = {};
        fields: Fields;

        constructor(root: HTMLElement, scanFields: boolean) {
            // querySelectorAll에는 자기 자신이 포함되지 않아서 이렇게 따로 검사함.
            if (root.hasAttribute('j8-listRoot')) { this.visitListRoot(root); }

            // 자식 listRoot 찾기
            root.querySelectorAll('[j8-listRoot]').forEach((elem: HTMLElement) => this.visitListRoot(elem));

            // control들 찾기
            root.querySelectorAll('[j8-control]').forEach((elem: HTMLElement) => {
                let cid = elem.getAttribute('j8-control');
                elem.removeAttribute('j8-control');

                if (this.controls[cid]) {
                    console.error('(Jul8) duplicate control id: [' + cid + ']')
                }
                this.controls[cid] = elem;
            });

            if (scanFields) {
                this.fields = new Fields();
                this.visitNode(root);
            }
        }

        private visitListRoot(elem: HTMLElement) {
            let itemId = elem.getAttribute('j8-listRoot');
            elem.removeAttribute('j8-listRoot');

            if (this.listRootElems[itemId]) {
                console.error('(Jul8) duplicate listItem id: [' + itemId + ']')
            }
            console.assert(elem.childElementCount == 0);

            this.listRootElems[itemId] = elem;
        }

        private visitNode(node: Node) {
            let childNodes = node.childNodes;
            if (childNodes.length > 0) {
                for (let i = 0; i < childNodes.length; ++i) {
                    this.visitNode(childNodes[i])
                }
            }
            else {
                if (node.textContent.search(pattern) >= 0) {
                    let n = { node: node, origText: node.textContent };
                    this.fields.nodes.push(n);
                }
            }

            let elem = node as Element;
            if (elem.attributes) {
                let replacedAttrs: { name: string, attr: Attr }[] = [];
                let removedAttrs: Attr[] = [];

                for (let i = 0; i < elem.attributes.length; ++i) {
                    let attr = elem.attributes[i];
                    let replacedLocalName = null;
                    if (attr.localName.substring(0, 8) === 'j8-attr-') {
                        replacedLocalName = attr.localName.substring(8);
                    }
                    if (attr.value.search(pattern) >= 0) {
                        let localName = replacedLocalName || attr.localName;
                        if (localName === 'style') { console.error("(Jul8) can't use {{ ... }} notation in `style` attribute."); }
                        if (localName === 'class') { console.error("(Jul8) can't use {{ ... }} notation in `class` attribute."); }
                        let a = { elem: elem, attr: attr, replacedLocalName: replacedLocalName, origValue: attr.value };
                        this.fields.attrs.push(a);
                        if (replacedLocalName) {
                            // j8-attr-* 속성은 DOM에는 남아 있지 않고 나중에 재구성한다.
                            removedAttrs.push(attr);
                        }
                    } else if (replacedLocalName) {
                        // j8-attr-XXX="YYY" 속성에 {{}}가 아예 안 들어 있을 수도 있다.
                        // 이 경우에도 XXX="YYY"로 일괄 처리는 해야 한다.
                        replacedAttrs.push({ name: replacedLocalName, attr: attr });
                    }
                }

                for (let { name, attr } of replacedAttrs) {
                    elem.removeAttributeNode(attr);
                    if (attr.namespaceURI !== null) {
                        elem.setAttributeNS(attr.namespaceURI, name, attr.value);
                    } else {
                        elem.setAttribute(name, attr.value);
                    }
                }

                for (let attr of removedAttrs) {
                    elem.removeAttributeNode(attr);
                }
            }
        }

        C(controlId: string): any {
            let ctl = this.controls[controlId];
            if (ctl === undefined) {
                console.error('(Jul8) no such control: [' + controlId + ']');
            }
            return ctl;
        }

        L<T extends View>(listItemId: string): ViewList<T> {
            let it = this.listRootElems[listItemId];
            if (it === undefined) {
                console.error('(Jul8) no such listItem: [' + listItemId + ']');
            }
            return new ViewList<T>(it);
        }
    }

    export class TemplateHolder {
        private templates: { [key: string]: HTMLElement } = {};

        constructor() { }

        addTemplateString(content: string): void {
            let beginMarker = '$(TemplateBegin)'
            let endMarker = '$(TemplateEnd)'
            let beginPos = content.indexOf(beginMarker);
            let endPos = content.indexOf(endMarker);
            let contentBody = content.substring(beginPos + beginMarker.length, endPos);

            let templateRoot = document.createElement("div");
            templateRoot.insertAdjacentHTML("beforeend", contentBody);
            this.addTemplateRoot(templateRoot);
        }

        addTemplateRoot(root: HTMLElement): void {
            root.querySelectorAll('[j8-template]').forEach((elem: HTMLElement) => {
                let tid = elem.getAttribute('j8-template');
                elem.removeAttribute('j8-template');
                elem.removeAttribute('j8-model');
                elem.remove();
                this.templates[tid] = elem;

                elem.querySelectorAll('[j8-listItem]').forEach((listElem: HTMLElement) => {
                    let lid = listElem.getAttribute('j8-listItem');
                    listElem.parentElement.setAttribute('j8-listRoot', lid);
                    listElem.removeAttribute('j8-listItem');
                    listElem.removeAttribute('j8-model');
                    listElem.remove();
                    this.templates[tid + '_' + lid] = listElem;
                })
            });
        }

        cloneTemplate(templateId: string): HTMLElement {
            let t = this.templates[templateId];
            if (t === undefined) {
                console.error('(Jul8) no such template: [' + templateId + ']');
            }

            return t.cloneNode(true) as HTMLElement;
        }
    }
}