"use strict";
let server = require('./jul8spa-server');

let dummyData = {}

//-----------------------------------------------------------------------------
function readBoardList(b, page, N) {
    var list = []
    for (let i = (page - 1) * N; i < page * N; ++i)
    {
        list.push({
            title: b.list[i].title,
            id: b.list[i].id
        });
    }

    return {
        name: b.name,
        list: list
    }
}

//-----------------------------------------------------------------------------
// 게시판들의 목록과 최근글들
server.addRoute('/', 'HomePage', () => {
    return {
        free: readBoardList(dummyData.free, 1, 5),
        humor: readBoardList(dummyData.humor, 1, 5),
        news: readBoardList(dummyData.news, 1, 5)
    }
});

//-----------------------------------------------------------------------------
// 개별 게시판 (제목만)
server.addRoute('/board', 'BoardPage', (parsedUrl, queryObject) => {
    let board = queryObject.boardName;
    let page = Number(queryObject.page) || 1;

    return readBoardList(dummyData[board], page, 15);
});

//-----------------------------------------------------------------------------
// 게시물
server.addRoute('/article', 'ArticlePage', (parsedUrl, queryObject) => {
    let board = queryObject.boardName;
    let page = Number(queryObject.page);
    let id = Number(queryObject.id);
    
    var b = dummyData[board];

    for (let a of b.list) {
        if (a.id == id) {
            return {
                name: b.name,
                article: a
            }
        }
    }
});

//-----------------------------------------------------------------------------
server.listen(8080);






//-----------------------------------------------------------------------------
// 테스트용 데이터
function createDummyData(boardName) {
    let a = [];
    for (let i = 1000; i >= 1; --i) {
        a.push({
            title: `${i}번째 게시물`,
            content: `${boardName} 게시판의 ${i}번째 게시물의 내용`,
            id: i
        });
    }
    return { name: boardName, list: a };
}
dummyData.free = createDummyData('자유게시판')
dummyData.humor = createDummyData('유우머')
dummyData.news = createDummyData('뉴우스')
