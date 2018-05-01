source('hello') //name: Hello Model
source('good morning') //name: Good Morning
source('welcome to') //name: Welcome To
source('welcome to') //name: Welcome To

target('world') //source: Hello Model -> optic:test/passthrough-transform
target('vietnam') //source: Good Morning -> optic:test/passthrough-transform
target('not_real') //source: Not Real -> optic:test/passthrough-transform