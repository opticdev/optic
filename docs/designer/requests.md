# Requests
In Optic, API endpoints are grouped by their paths. For example, the following requests would show up on the same page within the designer:
```
Repository by ID:

GET /repos/:owner/:repo
PATCH /repos/:owner/:repo
DELETE /repos/:owner/:repo
```

![](../images/grouping-examlpe.png)

## Adding a new Request
To add a new request, enter Design mode then click `+Add Request` in the navigation bar.  

**1. Choose your path:**

Paths are built one component at a time. 
- To represent a path parameter, use `:paramName` or `{paramName}` syntax.
- To advance to the next component of the path, press `/`.
- To go back to a previous component, use the backspace key. 

![](../images/path-builder.gif)

**2. Check all the request methods you'd like to create:**

You can always come back later and add additional methods.

![](../images/choose-methods.png)

**3. Click 'Create Requests':**

Optic will create the requests and redirect you to the page showing the resources you have created.

## Editing Requests
In Design mode, Optic will display the editors for creating, modifying, and deleting a request's parameters, responses, and body.
