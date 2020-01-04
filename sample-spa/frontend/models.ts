type ArticleData = {
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

type HomePageData = {
    free: BoardData,
    humor: BoardData,
    news: BoardData
}
