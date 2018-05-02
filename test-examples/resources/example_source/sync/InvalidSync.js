//valid path
source('hello') //name: Hello Model
target('world') //name: World, source: Hello Model -> optic:synctest/passthrough-transform

//invalid path
source('good morning') //name: Good Morning
target('vietnam') //source: Good Morning -> optic:synctest/errrrrrrorrrrrrrr
