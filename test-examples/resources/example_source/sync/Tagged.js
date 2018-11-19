const user = mongoose.model('peoples', new mongoose.Schema({ //optic.name = "User Model"
    'firstName': 'string',
    'lastName': 'string',
    'isAdmin': 'boolean',
    'newField': 'string',
}))

app.post('/users', function (req, res) { //optic.source = "User Model" -> optic:mongoose@0.1.0/createroutefromschema {"queryProvider": "optic:mongoose/insert-record"}

  otherCode.weWantToKeep()

  /*
    optic.tag = "query"
  */
  new Model({
  firstName: req.body.firstName,
  lastName: req.body.lastName,
  isAdmin: req.body.isAdmin }).save((err, item) => {
    if (!err) {
        res.send(200, item)
    } else {
        res.send(400, err)
    }
  })
})