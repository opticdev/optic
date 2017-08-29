var importModel = Model.define({
    "title": "Imports for (Javascript)",
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

importModel.instanceOf({
    definedAs: 'DEFINED AS',
    path: 'PATH'
})

models = [importModel]