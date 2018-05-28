const app = express()

app.get('first', handler) //name: Create Route


app.post('third', function (req, res) {

    doThing()
})