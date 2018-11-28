source('hello') //optic.name = "Hello Model"
source('good morning') //optic.name = "Good Morning"
source('welcome to') //optic.name = "Welcome To"
source('welcome to') //optic.name = "Welcome To"

target('world') //optic.source = "Hello Model" -> optic:synctest/passthrough-transform
target('vietnam') //optic.source = "Good Morning" -> optic:synctest/passthrough-transform
target('not_real') //optic.source = "Not Real" -> optic:synctest/passthrough-transform