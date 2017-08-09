/* Using Require -lang=Javascript -version=es5
var hello = require('world')
*/

Lens("Using Require", Model.load("JS.Import"))
    .component(Finder.string("hello")
               .getSet("node.properties.name", "declaredAs"))

	.component(Finder.string("'wo74874782rld'") //the part that is broken
		.getSet("node.properties.name", "pathTo")
    )