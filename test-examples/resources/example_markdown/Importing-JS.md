<!-- metadata name="imports" author="aidan" version="0.1.0" -->

# Importing a Module in Javascript

Like most other languages, Javascript has built in conventions for importing modules. Modules can be imported from another location on disk using a relative path. They can also be referenced by their name if they were included using a package manager like NPM. 

An import can be described with the following schema:
<!-- schema-def
     id='js-import' --> 
```json
    {
      "title": "import",
      "type": "object",
      "required": [
        "pathTo",
        "definedAs"
      ],
      "properties": {
        "pathTo": {
          "type": "string"
        },
        "definedAs": {
          "type": "string"
        }
      }
    }
```

## Using Require
You can import code using RequireJS like so where `pathTo` is the path or name of the module and `definedAs` is the name that module gets in the scope. 
<!-- lens-def
     name="import using require"
     schema="js-import" 
     "definedAs" => definedAs
     "pathTo".containing => pathTo 
--> 
```javascript
const definedAs = require('pathTo')
```     
     
## Using an es6 Import Statement
In es6 you can import modules directly using an import statement at the top of your file. 

<!-- lens-def
     name="import entire module w/ import statement"
     schema="js-import" 
     "definedAs" => definedAs
     "pathTo".containing => pathTo 
--> 
```javascript
import definedAs from 'pathTo'
```

