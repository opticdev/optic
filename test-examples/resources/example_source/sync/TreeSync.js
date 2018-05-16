source('a') //name: a
source('b') //name: b, source: a -> optic:synctest/passthrough-transform
source('c') //name: c, source: b -> optic:synctest/passthrough-transform
target('d') //name: d, source: c -> optic:synctest/passthrough-transform