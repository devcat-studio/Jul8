export default class Template {
    public templateId : string;
    public className : string;
    public modelName: string | null;
    public controls : Array<HTMLElement>;
    public listItems : Array<Template>;
    public fields : Set<string>;

    constructor(templateId: string, className: string, modelName: string | null) {
        this.templateId = templateId;
        this.className = className;
        this.modelName = modelName;

        this.controls = new Array<HTMLElement>();
        this.listItems = new Array<Template>();
        this.fields = new Set<string>();
    }
}