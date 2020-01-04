/// <reference path='templates.g.ts' />

class HomePage extends HomePage_d {
    constructor(data: HomePageData) {
        super(g_jul8, g_appRootNode);

        this.fillBoard(data.free, this.root);
        this.fillBoard(data.humor, this.root);
        this.fillBoard(data.news, this.root);
    }

    fillBoard(data: BoardData, parentNode: HTMLElement) {
        let view = new ArticleTitleList_d(data, g_jul8, parentNode);

        for (var it of data.list) {
            let viewData = {
                title: it.title,
                link: 'LINK_' + it.id
            }
            view.listOf_Item.add(new ArticleTitleList_Item_d(viewData, view));
        }
    }
}
