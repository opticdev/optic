source('hello') //optic.name = "Hello Model"
source('good morning') //"optic.name" = "Good Morning"

target('hello') //optic.source = "Hello Model" -> optic:synctest/passthrough-transform
target('good morning') //optic.source: "Good Morning"-> optic:synctest/passthrough-transform