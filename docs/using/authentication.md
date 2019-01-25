# Authentication
To setup authentication for your API, you just need to add an entry to your 'optic.yml' file. 

Today we support the following types of authentication:
- HTTP Basic (Authorization header with credentials)
```
authentication: basic
```
- HTTP Bearer (Authorization header with bearer token)
```
authentication: bearer
```
- API Key (An API key from a cookie, header, or query parameter)
```
authentication:
  - type: apiKey
  - in: cookie    #query, header or cookie
  - name: token
```

Email use at support@useoptic.com if you need us to include another form.
 
## How Endpoints are marked as Protected
Once you've configured your authentication scheme, Optic will automatically mark your authenticated endpoints in the API Spec. The inference is based off of the known properties of each authentication type. So if you have API Key authentication backed by a query parameter called token, all endpoints that include a query parameter called token will be marked as authenticated. 
