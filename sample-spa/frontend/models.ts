type ArticleData = {
    boardName: string,
    boardId: string,
    title: string,
    content: string,
    id: number
}

type ArticleListItemViewData = {
    title: string,
    link: string
}

type BoardData = {
    name: string,
    list: ArticleData[]
}

type BoardViewData = {
    name: string,
    link: string,
}

type HomePageData = {
    free: BoardData,
    humor: BoardData,
    news: BoardData
}
