source('first') //optic.name = "Hello Model"
source('second') //optic.name = "Good Morning"

target('hello') //optic.source = "Hello Model" -> optic:synctest/passthrough-transform
target('good morning') //optic.source = "Good Morning" -> optic:synctest/passthrough-transform