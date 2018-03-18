//Transformation Helpers

function Generate(schema, value, options) {
    return {
        schema: schema,
        value: value,
        options: options,
    }
}

function SetContents(children) {
    return {
        _type: "com.opticdev.sdk.descriptions.transformation.SetContents",
        children: children
    }
}

function AppendContents(children) {
    return {
        _type: "com.opticdev.sdk.descriptions.transformation.AppendContents",
        children: children
    }
}

