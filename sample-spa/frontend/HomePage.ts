/// <reference path='templates.g.ts' />

class HomePage extends HomePage_d {
    constructor(data: HomePageData) {
        super(g_jul8, g_appRootNode);

        this.fillBoard('free', data, this.root);
        this.fillBoard('humor', data, this.root);
        this.fillBoard('news', data, this.root);
    }

    fillBoard(boardId: string, homePageData: HomePageData, parentNode: HTMLElement) {
        let data = (<any>homePageData)[boardId];

        let viewData = {
            name: data.name,
            link: `/board?boardName=${boardId}`
        }
        let view = new ArticleTitleList_d(viewData, g_jul8, parentNode);

        for (var it of data.list) {
            let viewData = {
                title: it.title,
                link: `/article?boardName=${boardId}&id=${it.id}`
            }
            view.listOf_Item.add(new ArticleTitleList_Item_d(viewData, g_jul8));
        }
    }
}
