
## Swagger/OAS 2 
- Only the first entry in Produces / Consumes will be used as the content type. If there is no content type, but there is a schema, it will default to `application/json`
- The request body (first `in: body`, in parameters is always required)
- All Query Parameters are Strings
