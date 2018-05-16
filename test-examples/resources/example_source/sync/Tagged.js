const user = mongoose.model('peoples', new mongoose.Schema({ //name: User Model
    'firstName': 'string',
    'lastName': 'string',
    'isAdmin': 'boolean',
    'newField': 'string',
}))

app.post('/users', function (req, res) { //source: User Model -> optic:mongoose@0.1.0/createroutefromschema {"queryProvider": "optic:mongoose/insert-record"}

  otherCode.weWantToKeep()

  new Model({ firstName: req.body.firstName, //tag: query
  lastName: req.body.lastName,
  isAdmin: req.body.isAdmin }).save((err, item) => {
    if (!err) {
        res.send(200, item)
    } else {
        res.send(400, err)
    }
  })
})