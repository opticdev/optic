source('a') //name: a
source('0') //name: zero, source: a -> optic:synctest/passthrough-transform

target("b") //source: zero -> optic:synctest/passthrough-transform
target("b") //source: zero -> optic:synctest/passthrough-transform
target("b") //source: zero -> optic:synctest/passthrough-transform
