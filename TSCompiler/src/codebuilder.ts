import { stringify } from "querystring";
import fs from "fs";

export default class CodeBuilder {
    private code: Array<string>;
    private indentLevel: number = 0;

    public constructor() {
        this.code = new Array<string>();
        this.indentLevel = 0;
    }

    public appendLine(s:string = ""): void {
        this.code.push(this.indentation + s);
    }

    public get indentation(): string {
        return ' '.repeat(4 * this.indentLevel);
    }

    public indent(open: string, close: string, func: () => void): void {
        this.appendLine(open);
        this.indentLevel++;
        func();
        this.indentLevel--;
        this.appendLine(close);
    }

    public toString(): string {
        return this.code.join("\r\n");
    }

    public writeToFile(path: string): void {
        let content = this.code.join("\r\n");
        if ( fs.existsSync(path) && fs.readFileSync(path, 'utf8').toString() == content) {
            console.log("Skipping " + path + "...");
        }
        else {
            console.log("Writing " + path + "...");
            fs.writeFileSync(path, content, 'utf8');
        }
    }

}
