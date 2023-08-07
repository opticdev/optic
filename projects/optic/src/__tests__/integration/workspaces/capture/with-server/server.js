const http = require("http");

const host = "localhost";
const port = process.env.PORT || 5000;
const serverPrefix = process.env.SERVER_PREFIX;

const authors = [
  {
    id: "6nTxAFM5ck4Hob77hGQoL",
    name: "Jane Austen",
    created_at: "2023-04-22T17:17:41.326Z",
    updated_at: "2023-04-22T17:17:41.326Z",
  },
  {
    id: "tNpOpQZbxytxTxDT15GQy",
    name: "George Orwell",
    created_at: "2023-03-11T21:19:08.600Z",
    updated_at: "2023-03-11T21:19:08.600Z",
  },
];

const books = [
  {
    id: "WjE9O1d8ELCb8POiOw4pn",
    name: "Pride and Prejudice",
    author_id: "6nTxAFM5ck4Hob77hGQoL",
    price: 10,
    created_at: "2023-01-22T17:17:41.326Z",
    updated_at: "2023-01-22T17:17:41.326Z",
  },
  {
    id: "vZsYVmzdxtihxQNqCs-3f",
    name: "The Great Gatsby",
    author_id: "NjpTwgmENj11rGdUgpCQ9",
    price: 15,
    created_at: "2022-10-22T10:11:51.421Z",
    updated_at: "2022-10-22T10:11:51.421Z",
  },
];

const requestListener = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  const normalizedUrl = serverPrefix ? req.url.replace(serverPrefix, '') : req.url
  if (normalizedUrl === '/books' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({books}));
  } else if (normalizedUrl === '/books/status' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ok: true}));
  } else if (/^\/books\//i.test(normalizedUrl) && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify(books[0]));
  } else if (/^\/books\//i.test(normalizedUrl) && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify(books[0]));
  }else if (normalizedUrl === '/authors' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({authors}));
  } else if (normalizedUrl === '/healthcheck' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({authors}));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Resource not found" }));
  }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
