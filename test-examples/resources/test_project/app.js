let first = require('second')

app.get('user/:id', function (req, res) {
    req.query.id
})

app.get('post/:id', function (req, res) {
    req.query.id
})