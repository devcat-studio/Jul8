import fs, { symlinkSync, exists } from "fs";
import jsdom from "jsdom";
import Template from "./template";
import CodeBuilder from "./codebuilder";
import { ConfigRoot, BuildItem } from "./config";
import path from "path";
  
async function parseHtml(path: string): Promise<Array<Template>> {
    let result: string = await fs.promises.readFile(path , "utf8");
    let dom: jsdom.JSDOM = new jsdom.JSDOM(result);

    let templates: Array<Template> = new Array<Template>();
    
    let rootNode = dom.window.document.querySelector('body');
    
    if ( rootNode == null )
    {
        console.log('템플릿 파일( ' +  path +  ' )에서 <body> 를 찾을 수 없습니다.');
        process.exit(1);
        // 어차피 이 코드는 오지 않지만 IDE를 위해 써둠
        return new Array<Template>();;
    }

    let templateNodes = rootNode.querySelectorAll("*[j8-template]");

    // template들을 트리에서 뗀다.
    // 그대로 둔 상태로 처리하면 템플릿 안에 템플릿이 들어있을 때
    // controlId 같은것이 중복 파싱되는 문제가 생긴다.
    for(let ti:number = 0; ti < templateNodes.length; ti++) {
        let template = templateNodes[ti];
        if ( template == null ) {
            console.log('j8-template 객체를 찾았는데 null 입니다. 라이브러리 오류로 보입니다.');
            continue;
        }
        
        if ( template.parentElement != null ) { 
            template.parentElement.removeChild(template);
        }
    };

    for(let ti:number = 0; ti < templateNodes.length; ti++) {
        let template = templateNodes[ti];
        templates.push(parseTemplate(template, ""));
    };

    return templates;
}

function parseTemplate(templateNode: Element, namePrefix: string = ""): Template {
    
    let attrName = (namePrefix == "")? "j8-template" : "j8-listitem";
    let templateId:string | null = templateNode.getAttribute(attrName);

    if ( templateId == null )
    {
        console.log('객체를 찾았는데 j8-template or j8-listitem이 비어 있습니다??');
        process.exit(1);
    }

    let template: Template = new Template(
        templateId as string,
        namePrefix + templateId,
        templateNode.getAttribute('j8-model')
    );

    scanListItems(template, templateNode);

    let controlNodes = templateNode.querySelectorAll("*[j8-control]");
    Array.from(controlNodes).forEach((controlNode) => {
        let controlId: string = controlNode.getAttribute("j8-control") as string;
        template.controls.push(controlNode as HTMLElement);
    });

    let childNodes = templateNode.querySelectorAll("*");
    templateNode.querySelector("div");
    Array.from(childNodes).forEach((node) => {
        checkNode(template, node);
    });

    checkNode(template, templateNode);
    return template;
}

function scanListItems(template: Template, baseNode: Element): void {
    if ( baseNode.hasChildNodes() == false )
    {
        return;
    }
    
    // 순회 중 컨테이너 변경이 일어나기 때문에 ToArray로 한번 복사해서 순회
    Array.from(baseNode.children).forEach((node) => { 
        if ( node.getAttribute("j8-listitem") != null ) {
            node.remove();
            template.listItems.push(parseTemplate(node, template.className + "_"));
        }
        else {
            scanListItems(template, node);
        }
    });
}


function patternMatches(text: string): Array<string>{
    let result = new Array<string>();

    let pattern: RegExp = new RegExp("({{[^}]+}})", "g");
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
        result.push(match[0]);
    }

    return result;
}

function checkNode(template: Template, node: Element): void {
    if ( node.textContent == null ) {
        return;
    }

    let text = node.textContent as string;
    for(let m of patternMatches(text))
    {
        parseAndAddField(template, m);
    }

    // 속성에서도 field를 찾는다
    for(let i:number = 0; i < node.attributes.length; i++) {
        let attr = node.attributes.item(i) as Attr;
        if ( attr.value == null ) {
            continue;
        }

        for(let m of patternMatches(attr.value))
        {
            parseAndAddField(template, m);
        }
    }
}

function parseAndAddField(template: Template, matched: string): void {
    let fname: string = matched.substr(2, matched.length - 4).trim();
    template.fields.add(fname);
}

async function main(): Promise<void> {
    if ( process.argv.length <= 1  ) {
        console.log('usage: npm start <JUL8CONFIG.JSON>');
        process.exit(1);
    }

    // ts-node로 실행할때는 파라미터 첫번째에 ts파일이 들어오기 마지막 파라미터를 꺼내오게 한다
    let lastArgv = process.argv.reverse()[0];
    let data = fs.readFileSync(lastArgv, 'utf8');
    let config = <ConfigRoot>JSON.parse(data.toString());

    let dir = path.dirname(lastArgv);
    for(let item of config.build) {
        let sourcePath = path.join(dir, item.source);
        let targetPath = path.join(dir, item.target);

        let templates = await parseHtml(sourcePath);
        generateTypeScript(config, templates, targetPath);
    }
}

function generateTypeScript(config: ConfigRoot, templates: Array<Template>, path: string): void {
    let cb: CodeBuilder = new CodeBuilder();

    for (let ln of config.header)
    {
        cb.appendLine(ln);
    }

    for(let template of templates) {
        generateClass(cb, template, null);
    }

    for (let ln of config.footer)
    {
        cb.appendLine(ln);
    }

    cb.writeToFile(path);
}

function generateClass(cb: CodeBuilder, template: Template, optionalParentClassName: string | null) {
    let useModel: boolean = ( template.fields.size >0 || template.modelName != null);

    cb.appendLine(`class ${template.className}_d implements Jul8.View`);
    cb.indent('{', '}', () => {
        if ( optionalParentClassName != null) {
            cb.appendLine(`_parent: ${optionalParentClassName}_d;`);
        }

        cb.appendLine("$: JQuery;");

        for(let control of template.controls) {
            // TODO: JQuery를 제거하는경우 여기서 타입을 출력해준다
            let controlId: string = control.getAttribute("j8-control") as string;
            cb.appendLine(controlId + ': JQuery;');
        }

        for(let listItem of template.listItems) {
            cb.appendLine(`listOf_${listItem.templateId}: Jul8.ViewList<${listItem.className}_d>;`);
        }
        cb.appendLine();

        // 생성자
        if ( optionalParentClassName == null ) {
            cb.appendLine("constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)");
        }
        else {
            if (useModel) {
                cb.appendLine(`constructor(data: ${template.modelName}, parent: ${optionalParentClassName}_d)`);
            }
            else {
                cb.appendLine(`constructor(parent: ${optionalParentClassName}_d)`);
            }
        }

        cb.indent('{', '}', () => {
            if ( optionalParentClassName == null ) {
                cb.appendLine(`this.$ = templateHolder.cloneTemplate('${template.templateId}');`);
                cb.appendLine("if (parentNode) { parentNode.append(this.$); }");
            }
            else {
                cb.appendLine("this._parent = parent;");
                cb.appendLine(`this.$ = parent.listOf_${template.templateId}._cloneTemplate();`);
            }
            cb.appendLine(`let s = new Jul8.Scanner(this.$, ${useModel ? "true": "false"});`);
            if(useModel) {
                cb.appendLine("this.j8fields = s.fields;");
            }

            for(let control of template.controls) {
                let controlId: string = control.getAttribute("j8-control") as string;
                cb.appendLine(`this.${controlId} = s.C('${controlId}');`);
            }

            for(let listitem of template.listItems) {
                cb.appendLine(`this.listOf_${listitem.templateId} = s.L<${listitem.className}_d>('${listitem.templateId}');`);
            }

            if(useModel) {
                cb.appendLine("if (data) { this.set(data); }");
            }
        });

        if (useModel) {
            cb.appendLine("");
            cb.appendLine("private j8fields: Jul8.Fields;");
            cb.appendLine(`set(data: ${(template.modelName != null )? template.modelName : "any"}): void`);
            cb.indent('{', '}', () => {
                if(template.modelName != null) {
                    for(let f of template.fields) {
                        cb.appendLine(`data.${f};`);
                    }
                    cb.appendLine("this.j8fields.set(data);");
                }
            });
        }
    });

    cb.appendLine("");

    for(let item of template.listItems) {
        generateClass(cb, item, template.className);
    }
}

main().then(() => {
    // await 함수를 기다리기 위한 방법
},
err => {
    console.log(err);
});