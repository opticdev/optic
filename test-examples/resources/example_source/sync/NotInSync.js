source('first') //name: Hello Model
source('second') //name: Good Morning

target('hello') //source: Hello Model -> optic:synctest/passthrough-transform
target('good morning') //source: Good Morning -> optic:synctest/passthrough-transform