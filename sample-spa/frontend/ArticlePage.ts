/// <reference path='templates.g.ts' />

class ArticlePage extends ArticlePage_d {
    constructor(data: ArticleData) {
        super(data, g_jul8, g_appRootNode);

        

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
