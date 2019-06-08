
- Inline objects used as Array items will not have their properties copied 

## Swagger/OAS 2 
- Only the first entry in Produces / Consumes will be used as the content type. If there is no content type, but there is a schema, it will default to `application/json`
- The request body (first `in: body` in parameters[] is always required)
- All Query Parameters are Strings
- Authentication is not currently imported

## Swagger/OAS 3
- Throws out `default` response (too ambiguous)
- examples will not be used
- Only the first content-type for a response or `application/json` is used
- All Query Parameters are Strings
- The following component types and references to them are not supported

    - parameters
    - examples
    - requestBodies
    - headers
    - securitySchemes
    - links
    - callbacks 
   
- Authentication is not currently imported 