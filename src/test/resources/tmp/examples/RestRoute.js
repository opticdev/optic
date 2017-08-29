var routeModel = Model.define({
    "title": "Route",
    "identifier": "Rest_Route",
    "description": "A rest endpoint ",
    "type": "object",
    "properties": {
        "path": {
            "type": "string"
        },
        "method": {
            "type": "string"
        },
        "parameters": {
            "type": "object",
            "items": { "type": "parameter" },
        },
        "responses": {
            "type": "object",
            "items": { "type": "response" },
        },
    },
    "required": ["definedAs", "path"]
})

/* Express JS REST Endpoint -lang=Javascript -version=es5
app.get('/', function (req, res) {
  res.send('hello world')
})
*/

Lens("Express JS REST Endpoint", routeModel, require(["js.express"]))
	.component(Finder.string("get")
		.getSet("name", "method"))

	.component(Finder.string("/")
		.getSet("value", "path"))

	.component(Finder.string("/")
		.getSet("value", "path"))
	.component(Finder.type("FunctionDeclaration"))
		.subcomponents(()=> {

			/* Express JS REST Parameter -lang=Javascript -version=es5
			req.query.key
			*/
			Lens("Express JS REST Parameter", Model.load("js.express.parameter"), require(["js.express"]))
				.component(Finder.string("query")
					.getSet("name", "type"))

				.component(Finder.string("key")
					.getSet("name", "name"))

			/* Express JS REST Response -lang=Javascript -version=es5
			res.send('hello world')
			*/
			Lens("Express JS REST Response", routeModel, require(["js.express"]))
				.component(Finder.string("hello world")
					.getSet(Lookup("type"), "responseType")
					.rules("node.type", Values.Any)
				)


		})



