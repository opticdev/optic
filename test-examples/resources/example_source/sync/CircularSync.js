/*
optic.name = "First"
optic.source = "Third" -> optic:synctest/passthrough-transform
*/
source('start')

/*
optic.name = "Second"
optic.source = "Third" -> optic:synctest/passthrough-transform
*/
source('start')

/*
optic.name = "Third"
optic.source = "Second" -> optic:synctest/passthrough-transform
*/
source('start')
