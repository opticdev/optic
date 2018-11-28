source('a') //optic.name = "a"
/*
optic.name = "zero"
optic.source = "a" -> optic:synctest/passthrough-transform
*/
source('0')

target("b") //optic.source = "zero" -> optic:synctest/passthrough-transform
target("b") //optic.source = "zero" -> optic:synctest/passthrough-transform
target("b") //optic.source = "zero" -> optic:synctest/passthrough-transform
