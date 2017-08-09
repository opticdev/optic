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

//models = [importModel]