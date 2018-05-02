source('a') //name: a
source('b') //name: b, source: a -> optic:synctest/passthrough-transform
source('c') //name: c, source: b -> optic:synctest/errrrrorrrrrrrr
target('d') //name: d, source: c -> optic:synctest/passthrough-transform
target('e') //name: e, source: d -> optic:synctest/passthrough-transform