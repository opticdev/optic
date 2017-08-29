var importModel = Model.define({
    "title": "Import",
    "identifier": "JS.Import",
    "description": "A model of files being imported ",
    "type": "object",
    "properties": {
        "definedAs": {
            "type": "string"
        },
        "path": {
            "type": "string"
        }
    },
    "required": ["definedAs", "path"]
})

var startModel = Model.define({
    "title": "Start Thing",
    "identifier": "JS.Test.Start",
    "description": "Start ___ model",
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        }
    },
    "required": ["name"]
})

Group("Group Test")
    .required(Model.load("JS.Import").instanceOf({definedAs: "hello", path: "world"}))
    .required(Model.load("JS.Import").instanceOf({definedAs: "weird", path: "Man"}))
    /* Start Code -lang=Javascript -version=es5
    hello.start('Howdy!')
    */
    .distinct(Lens("Start Code", startModel)
        .component(Finder.string("'Howdy!'")
            .getSet("value", "name")
        )
    )