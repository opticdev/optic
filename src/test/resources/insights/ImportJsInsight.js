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

Insight.define({
    //meta information
    name: "Import",
    version: 1.0,
    language: [{
        name: "Javascript",
        supportedVersions: ["es6"]
    }],

    enterOn: ["VariableDeclaration"],

    parser: function (a0) {
        var model = {}

        if (a0.type === "VariableDeclaration" && (a0.properties.kind === "var")) {

            var a1 = a0.declarations[0]

            if (a1.type === "VariableDeclarator") {

                var a2 = a1.id[0]
                if (a2.type === "Identifier") {
                    model.declaredAs = a2.properties.name

                } else {
                    return null
                }

                var a2 = a1.init[0]
                if (a2.type === "CallExpression") {

                    var a3 = a2.callee[0]
                    if (a3.type === "Identifier" && (a3.properties.name === "require")) {

                    } else {
                        return null
                    }

                    var a3 = a2.arguments[0]
                    if (a3.type === "Literal") {
                        model.pathTo = a3.properties.value



                    } else {
                        return null
                    }


                } else {
                    return null
                }


            } else {
                return null
            }


        } else {
            return null
        }

        if (Object.keys(model).length > 0) {
           return [{
               model: importModel.instanceOf({
                         definedAs: model.declaredAs,
                         path: model.pathTo
               }),
               dependencies: {"variable": a0}
           }]
       }

    },

    writer: function (model, dependents) {

    print(dependents.variable)

        var variable = dependents.variable.declarations[0]

        //declaredAs
        var identifier = variable.id[0]
        identifier.mutator.replaceString(model.definedAs)

        //pathTo
        var literal = variable.init[0].arguments[0]
        literal.mutator.replaceString("\""+model.path+"\"")
    }

})

