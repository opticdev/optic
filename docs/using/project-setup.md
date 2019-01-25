# Project Setup
To document your API with Optic, you need to include an 'optic.yml' file in the root directory of that API. This configuration file provides Optic with the basic information it needs to accurately document your API. 

Here's an example of an 'optic.yml' file: 

```yaml
name: My API
team: optic-team

test: npm run test
host: localhost
port: 3005

paths:
  - /users
  - /users/login
  - /users/:userId/followers
```

**name** - The name of this API. It must match the name of an Optic project you've created on the website.

**team** (optional) - The id of the team that owns this project

**test** - The command used to execute the API tests. Optic will run this command from the same directory as the config file. Make sure it will execute from that location

**host** - The hostname of the server used in your tests

**port** - The port of the server used in your tests

## Paths
Optic lets you specify which endpoints should be included in your documentation by adding entries to the **paths** array. Optic will try to match each request that passes through the proxy with one of these paths. If one or more requests is observed that match a path, it will be included in the documentation. If you have multiple operations that use the same path, but different HTTP Methods, you don't have to make duplicate those entries.

For example:
```yaml

paths:
  - /users 
  # Matches POST /users
  # Matches GET  /users
  # Matches PUT  /users
  
  - /users/:userId/followers
  # Matches GET /users/user1/followers
  # Matches POST /users/user1/followers
  
  # Does not match GET  /model/:item/:property
  # Does not match POST /authenticate
```

These path strings conform to version 3.0.0 of [path-to-regexp](https://www.npmjs.com/package/path-to-regexp), a popular npm package with over 10 million weekly downloads. There is an [online sandbox](http://forbeslindesay.github.io/express-route-tester/) that can help you validate your paths.

While all options in path-to-regexp are supported, most API paths will only need to include the provided named parameters syntax ':name'. Here are some examples to review:

```yaml
paths:
  - /users/:id
  # Matches /users/123
  # Matches /users/abc
  # Matches /users/456?query_param=true
  
  # Does not match /users:abc
  # Does not match /users/123/profile
  
  - /trips/from:cityA-to:cityB
  # Matches /trips/from:toronto-tophiladelphia  
  # Matches /trips/from:london-tophiladelphia  
  # Does not match /trips/from/london/to/philadelphia  
```

## Summary
That's it! To get a fully documented API just add the name of this Optic project, configure the proxy, and specify the paths you'd like to see included. Optic takes care of the rest.