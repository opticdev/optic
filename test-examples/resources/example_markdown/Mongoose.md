<!-- metadata name="mongoose" author="optic" version="0.1.0" -->

<!-- DEPENDENCIES optic:rest@0.1.0 -->
     
# Mongoose JS

Mongoose is a [MongoDB](https://www.mongodb.org/) object modeling tool designed to work in an asynchronous environment.

## Support

  - [Stack Overflow](http://stackoverflow.com/questions/tagged/mongoose)
  - [Bug Reports](https://github.com/Automattic/mongoose/issues/optic:mongoose@0.1.0.md)
  - [Mongoose Slack Channel](http://slack.mongoosejs.io/)
  - [Help Forum](http://groups.google.com/group/mongoose-orm)
  - [MongoDB Support](https://docs.mongodb.org/manual/support/)

## Importing

```javascript
// Using Node.js `require()`
const mongoose = require('mongoose');

// Using ES6 imports
import mongoose from 'mongoose';
```

## Overview

### Connecting to MongoDB

First, we need to define a connection. If your app uses only one database, you should use `mongoose.connect`. If you need to create additional connections, use `mongoose.createConnection`.

Both `connect` and `createConnection` take a `mongodb://` URI, or the parameters `host, database, port, options`.

<!-- 
lens-def
name="Connect to MongoDB"
id="connect-to"
language="es7"
schema="connect"
'mongodb'.containing => URI
-->
```javascript
mongoose.connect('mongodb://localhost/my_database');
```

Once connected, the `open` event is fired on the `Connection` instance. If you're using `mongoose.connect`, the `Connection` is `mongoose.connection`. Otherwise, `mongoose.createConnection` return value is a `Connection`.

**Note:** _If the local connection fails then try using 127.0.0.1 instead of localhost. Sometimes issues may arise when the local hostname has been changed._

**Important!** Mongoose buffers all the commands until it's connected to the database. This means that you don't have to wait until it connects to MongoDB in order to define models, run queries, etc.

### Defining a Model

Models are defined through the `Schema` interface.

<!-- 
lens-def
name="Define Model"
id="define"
language="es7"
schema="mongoose-schema"
'model' => name
'{'.starting => schema 
-->
```javascript
const model = mongoose.model('ModelName', 
new Schema({
    name    : 'string',
    age    : 'number',
}));
```

### Optic Schemas
This is the schema (we know, very meta) for Mongoose Models. It's exported from as `optic:mongoose/schema` and can be referenced by other knowledge in the Optic ecosystem 
<!-- schema-def
     id='schema' --> 
```json
{
	"title": "Mongoose Schema",
	"type": "object",
	"properties": {
		"name": {
			"type": "string"
		},
		"schema": {
			"type": "object",
			"patternProperties": {
				"^.*$": {
					"anyOf": [{
						"$ref": "#/definitions/field"
					}]
				}
			},
			"additionalProperties": false
		}
	},
	"definitions": {
		"field": {
			"type": "object",
			"properties": {
				"type": {
					"type": "string",
					"enum": ["string", "number", "boolean", "date"]
				}
			}
		}
	}
}
```
The basic schema for connect. v0.2.0 of Markdown SDK will support anonymous schemas so this won't be here. 
<!-- schema-def
     id='connect' --> 
```json
{
	"title": "Connect Schema",
	"type": "object",
	"properties": {
		"URI": {
			"type": "string"
		}
    }
}
```


### Transformations
#### Generate Rest Route From Schema
<!-- transformation-def
yields="Create Route"
id="createroutefromschema"
input="schema"
output="optic:rest/route" -->
```javascript
function transform(input) {
    const routeName = input.name.toLowerCase()
    const route = "/"+routeName
    
    const parameters = Object.keys(input.schema).map(i=> {
        return {
            in: 'body',
            name: i
        }
    })
    
    return {
        method: "post",
        url: route,
        parameters
    }
}
```