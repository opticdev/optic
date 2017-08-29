var usageModel = Model.define({
    "title": "Example Usage",
    "identifier": "Express.Usage",
    "type": "object",
    "properties": {

    }
})


/* Example -lang=Javascript -version=es5
app.post()
*/

Lens("Example", usageModel)
    .variable("app")
