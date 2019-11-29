export class ConfigRoot {
    public header: Array<string>;
    public footer: Array<string>;
    public build: Array<BuildItem>;

    public constructor() {
        this.header = new Array<string>();
        this.footer = new Array<string>();
        this.build = new Array<BuildItem>();
    }
}

export class BuildItem {
    public source: string;
    public target: string;

    public constructor() {
        this.source = '';
        this.target = '';
    }
}