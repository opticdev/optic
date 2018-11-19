source('a') //optic.name = "a"

/*
optic.name = "b"
optic.source = "a" -> optic:synctest/passthrough-transform
*/
source('b')

/*
optic.name = "c"
optic.source = "b" -> optic:synctest/passthrough-transform
*/
source('c')

/*
optic.name = "d"
optic.source = "c" -> optic:synctest/passthrough-transform
*/
target('d')

/*
optic.name = "e"
optic.source = "d" -> optic:synctest/passthrough-transform
*/
target('e')