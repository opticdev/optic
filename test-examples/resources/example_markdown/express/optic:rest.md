<!-- metadata name="rest" author="optic" version="0.1.0" -->

# Rest
RESTful APIs are a key feature of the modern web. 

***lots of info about Rest APIs

<!-- schema-def
     id='route' --> 
```json
    {
          "title": "Route",
          "type": "object",
          "required": ["method", "url"],
          "properties": {
            "method": {
              "type": "string"
            },
            "url": {
              "type": "string"
            },
            "parameters": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/parameter"
              }
            }
          },
          "definitions": {
            "parameter": {
              "title": "Parameter",
              "type": "object",
              "required": ["in", "name"],
              "properties": {
                "in": {
                  "type": "string"
                },
                "name": {
                  "type": "string"
                }
              }
             }
          }
    }
```