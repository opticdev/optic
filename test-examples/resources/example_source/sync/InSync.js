source('hello') //name: Hello Model
source('good morning') //name: Good Morning

target('hello') //source: Hello Model -> optic:synctest/passthrough-transform
target('good morning') //source: Good Morning -> optic:synctest/passthrough-transform