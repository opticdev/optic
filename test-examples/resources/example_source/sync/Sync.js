source('hello') //name: Hello Model
source('good morning') //name: Good Morning
source('welcome to') //name: Welcome To
source('welcome to') //name: Welcome To

target('world') //source: Hello Model -> optic:synctest/passthrough-transform
target('vietnam') //source: Good Morning -> optic:synctest/passthrough-transform
target('not_real') //source: Not Real -> optic:synctest/passthrough-transform