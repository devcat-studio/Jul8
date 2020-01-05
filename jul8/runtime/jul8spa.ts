class Jul8SPA
{
    scope: any;

    constructor(scope: any) {
        this.scope = scope;        
    }

    initializePage(arg: any[]): void {
        let routingTable: { [id: string]: string } = arg[0];
        let data: any = arg[1];

        let pathname = document.location.pathname;
        let className = routingTable[pathname];
        let klass: any = this.scope[className];
        console.assert(klass, `[Jul8SPA] ${className} - Page class not found`);
        let object: any = new klass(data);
    }
}
