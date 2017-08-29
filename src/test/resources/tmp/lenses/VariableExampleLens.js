/* Test -lang=Javascript -version=es5
function me () {
    var hello = require('example-one/test')
    hello.world('world')
}
*/


Lens("Test", Model.empty())

	.component(Finder.string("'world'")
		.getSet("value", "pathTo")
    )

    .variable("hello")




//    .rule(Finder.node(function (node) {
//            return node.type == "Identifier" && node.properties.name == "hello"
//        }).propRule({name: "hello"})
//    )
//
