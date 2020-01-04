"use strict";
var fs = require('fs');
var url = require('url');
var path = require('path');
var http = require('http');
var querystring = require('querystring');

//-----------------------------------------------------------------------------
function serveStatic(req, res) {
    var filePath = './html' + req.url;
    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404);
                res.end('404 not found', 'utf-8');
            }
            else {
                res.writeHead(500);
                res.end('internal server error: ' + error.code, 'utf-8');
            }
        }
        else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

//-----------------------------------------------------------------------------
var routes = {}

module.exports.addRoute = function(path, frontendClass, dataPreparingFunction) {
    routes[path] = {
        frontendClass: frontendClass,
        dataPreparingFunction: dataPreparingFunction
    };
}

module.exports.listen = function(port) {
    http.createServer((req, res) => {
        console.log(req.method + ' ' + req.url);

        // 정적 파일
        if (req.url.startsWith('/static/')) {
            return serveStatic(req, res);
        }

        let parsedUrl = url.parse(req.url);

        // ajax
        if (parsedUrl.pathname.startsWith('/ajax/')) {
            let pathname = parsedUrl.pathname.substring('/ajax'.length);
            let r = routes[pathname];

            let dbData = r.dataPreparingFunction(parsedUrl, querystring.parse(parsedUrl.query))
            
            res.writeHead(200, {'Content-Type': 'text/json; charset=utf-8'});
            res.write(JSON.stringify(dbData));
            res.end();
            return;
        }

        // 일반 페이지
        let r = routes[parsedUrl.pathname];
        if (r) {
            let routingTable = {}
            for (let path in routes) {
                routingTable[path] = routes[path].frontendClass;
            }

            let dbData = r.dataPreparingFunction(parsedUrl, querystring.parse(parsedUrl.query))

            fs.readFile('html/index.html', 'utf8', function(err, fileData){
                let resData = fileData.replace("(JUL8SPA_INIT_PARAMS_HERE)", JSON.stringify([routingTable, dbData]));
    
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(resData);
                res.end();
            });
        }
        else {
            res.writeHead(404);
            res.end('404 not found', 'utf-8');
        }
    }).listen(port);
}