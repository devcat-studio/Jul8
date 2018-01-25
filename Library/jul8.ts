namespace Jul8 {
    ///////////////////////////////////////////////////////////////////////////
    export interface Element {
        $: JQuery;
    }

    ///////////////////////////////////////////////////////////////////////////
    export class ElementList<T extends Element> {
        private _T_: Jul8.TemplateInstance;
        private list: T[] = [];

        constructor(templateInstance: Jul8.TemplateInstance) {
            this._T_ = templateInstance;
        }

        add(type: { new(t: Jul8.TemplateInstance): T }): T {
            let t = this._T_.addListItem('TR');
            let child = new type(t);
            this.list.push(child);
            return child;
        }

        remove(child: T): void {
            let idx = this.list.indexOf(child);
            if (idx >= 0) {
                this.list.splice(idx, 1);
                child.$.remove();
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    export class TemplateInstance {
        _root: JQuery;
        _controls: { [key: string]: JQuery } = {};
        _lists: { [key: string]: { list: JQuery, itemTemplate: JQuery } } = {};

        //---------------------------------------------------------------------
        constructor(root: JQuery) {
            this._root = root;

            // 리스트 항목은 부모로부터 뗀다.
            // 그래야 처음에는 없고, 추가하는 만큼 붙일 수 있으니까.
            root.find('[data-listItemId]').each(
                (i, v) => {
                    let itemId = v.getAttribute('data-listItemId');

                    if (this._lists[itemId]) {
                        alert('duplicate listItem id: [' + itemId + ']')
                    }

                    let j = $(v);
                    let p = j.parent();
                    j.detach();
                    this._lists[itemId] = { list: p, itemTemplate: j };
                });

            // 템플릿과 다르게 컨트롤들은 부모로부터 떼지 않는다.
            // 이미 템플릿 단위로 복제 생성된 상태이기 때문.
            root.find('[data-controlId]').each(
                (i, v) => {
                    let cid = v.getAttribute('data-controlId');

                    if (this._controls[cid]) {
                        alert('duplicate control id: [' + cid + ']')
                    }
                    this._controls[cid] = $(v);
                });
        }

        //---------------------------------------------------------------------
        C(controlId: string): JQuery {
            let ctl = this._controls[controlId];
            if (ctl === undefined) {
                alert('no such control: [' + controlId + ']');
            }
            return ctl
        }

        //---------------------------------------------------------------------
        root(): JQuery {
            return this._root;
        }

        //---------------------------------------------------------------------
        addListItem(listItemId: string): TemplateInstance {
            let it = this._lists[listItemId];
            if (it === undefined) {
                alert('no such listItem: [' + listItemId + ']');
            }
            let rv = it.itemTemplate.clone();
            it.list.append(rv);
            return new TemplateInstance(rv);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    export class TemplateHolder {
        templates: { [key: string]: JQuery } = {};

        //---------------------------------------------------------------------
        constructor() {
        }

        //---------------------------------------------------------------------
        addTemplateString(content: string): void {
            let beginMarker = '$(TemplateBegin)'
            let endMarker = '$(TemplateEnd)'
            let beginPos = content.indexOf(beginMarker);
            let endPos = content.indexOf(endMarker);
            let contentBody = content.substring(beginPos + beginMarker.length, endPos);

            this.addTemplateRoot($(contentBody));
        }

        //---------------------------------------------------------------------
        addTemplateRoot(root: JQuery): void {
            root.find('[data-templateId]').each(
                (i, v) => {
                    let j = $(v);
                    j.detach();
                    let tid = v.getAttribute('data-templateId');
                    this.templates[tid] = j;
                });
        }

        //---------------------------------------------------------------------
        create(templateId: string, parent?: JQuery): TemplateInstance {
            let t = this.templates[templateId];
            if (t === undefined) {
                alert('no such template: [' + templateId + ']');
            }
            var rv = new TemplateInstance(t.clone());
            if (parent) {
                parent.append(rv.root());
            }
            return rv;
        }
    }
}
