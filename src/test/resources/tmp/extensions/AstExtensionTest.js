AstExtension({
    type: "VariableDeclaration",
    model: Model.define({"type": "object",
            "properties": {
                "kind": {
                    "enum": ["let", "var"],
                    "type": "string"
                }
            },
            "required": ["kind"]
    }),
    lang: 'Javascript',
    versions: ["es5", "es6"],
    write: function (node, old, updated) {

        var stringValue = node.mutator.getString()

        var oldKind = old.kind
        var newKind = updated.kind

        var updatedStringValue = stringValue.replace(oldKind, newKind)

        node.mutator.replaceString(updatedStringValue)

    }
})