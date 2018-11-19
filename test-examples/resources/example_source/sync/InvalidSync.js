//valid path
source('hello') //optic.name = "Hello Model"
/*
optic.name = "World"
optic.source = "Hello Model" -> optic:synctest/passthrough-transform
*/
target('world')

//invalid path
source('good morning') //optic.name = "Good Morning"
target('vietnam') //optic.source = "Good Morning" -> optic:synctest/errrrrrrorrrrrrrr
