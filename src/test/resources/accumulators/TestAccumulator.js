Accumulator.define({
    name: "Test Accumulator",
    version: 1.0,
    collect: {
        "JS.Import": {
            presence: "required",
            value: {"path": "express"},
        },
        "Express.Usage": {
            presence: 'distinct',
        }
    }
})