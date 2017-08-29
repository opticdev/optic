/* Using Require -lang=Javascript -version=es5
var hello = require('world')
*/

Lens("Using Require", Model.load("JS.Import"))
    .component(Finder.string("hello")
        .getSet("name", "declaredAs"))

	.component(Finder.string("'world'")
		.getSet("value", "pathTo")
    )

