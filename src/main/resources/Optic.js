var output = new Output()
var block  = null
function Output() {
    this.lenses = []
    this.groups = []
    this.models = []
    this.insights = []
    this.accumulators = []
    this.extensions = []
    this.dependencies = {
        models: [],
        lenses: []
    }
}

function clearAll() {
    output = new Output()
    block  = null
}


function Group(name, modelDefinition) {

    var group;

    if (modelDefinition) {
        group = protected.Group.define(name, modelDefinition);
    } else {
        group = protected.Group.define(name);
    }

    output.groups.push(group);
    return group;

}

function Lens(name, modelDefinition) {
    var exampleBlock = foundExamples[name]
    if (exampleBlock) {
        var lens = protected.LensImpl.define(name, modelDefinition, exampleBlock)
        output.lenses.push(lens)
        return lens
    } else {
        throw new Error("Could not find Example Code Block for '"+name+"'")
    }
}


function Model() {
    this.define = function (schema) {
        var model = protected.Model.define(schema, protected.Provider)
        output.models.push(model)
        return model
    }

    this.load = function (identifier) {
        var model = protected.Model.load(identifier, protected.Provider)
        output.dependencies.models.push(model)
        return model
    }

    this.empty = function (identifier) {
        var model = protected.Model.empty(protected.Provider)
        output.dependencies.models.push(model)
        return model
    }
}

function Insight() {
    this.define = function (definition) {
        var insight = protected.Insight.define(definition, protected.Provider)
        output.insights.push(insight)
        return insight
    }
}

function Accumulator() {
    this.define = function (definition) {
        var accumulator = protected.Accumulator.define(definition, protected.Provider)
        output.accumulators.push(accumulator)
        return accumulator
    }
}

function allFinders() {

    return {
        string: function (string, occurrence) {
            if (typeof occurrence === 'undefined') {
                occurrence = 0
            }
            return protected.ComponentImpl.define(Finders.string(string, occurrence))
        },
        range: function (start, end) {
            return protected.ComponentImpl.define(Finders.range(start, end))
        },
        node: function (block) {
            return protected.ComponentImpl.define(Finders.node(block))
        }
    }

}

function AstExtension(options) {

    var extension =  protected.AstExtensionImpl.define(
        options.type,
        options.model,
        options.lang,
        options.versions,
        options.write
    )

    output.extensions.push(extension)

}

function Shared() {
    return protected.SharedStore.empty()
}