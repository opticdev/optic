//Transformation Helpers

function Generate(schema, value, options) {
    return {
        schema: schema,
        value: value,
        options: options,
        _isStagedNode: true
    }
}

function Mutate(modelId, value, options) {
    return {
        modelId: modelId,
        value: value,
        options: options,
        _isStagedMutation: true
    }
}


//Model Setters
function Code(value) {
    return {
        _valueFormat: 'code',
        value: value
    }
}

function Token(value) {
    return {
        _valueFormat: 'token',
        value: value
    }
}