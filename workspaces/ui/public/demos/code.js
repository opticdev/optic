const crypto = require("crypto");

const putRequestNoPriority = {
    title: "Get Milk",
}

const putResponseNoPriorityId = crypto.randomBytes(4).toString("hex")
const putResponseNoPriority = {
    status: "success",
    id: putResponseNoPriorityId,
    created: {
        title: "Get Milk",
        createdAt: Date.now(),
        completed: false,
        priority: "medium",
        id: putResponseNoPriorityId,
    }
}

const putRequestWithPriority = {
    title: "Recommend Optic to Team",
    priority: "high"
}

const putResponseWithPriority = {
    status: "success",
    id: crypto.randomBytes(4).toString("hex"),
    created: {
        title: "Recommend Optic to Team",
        createdAt: Date.now(),
        completed: false,
        priority: "high",
        id: crypto.randomBytes(4).toString("hex"),
    },
}

const postRequestAdjustTitle = {
    title: "Recommend Optic to Engineering Team"
}

let postResponseAdjustTitle = {
    status: "modified",
    id: putResponseWithPriority.id,
    object: {
        ...putResponseWithPriority.created,
        title: postRequestAdjustTitle.title,
    }
}
postResponseAdjustTitle.object.id = postResponseAdjustTitle.id

const postRequestComplete = {
    completed: true
}

const postResponseComplete = {
    status: "modified",
    id: putResponseWithPriority.id,
    object: {
        completed: true,
        ...putResponseWithPriority.created
    }
}

const todos = [
    putResponseNoPriority.created, putResponseWithPriority.created
]

// console.log("GET /api/todos")
// console.log(JSON.stringify(todos))
// console.log("—————————————————————")
// console.log("PUT /api/todos")
// console.log("Request No Priority")
// console.log(JSON.stringify(putRequestNoPriority))
// console.log("Response No Priority")
// console.log(JSON.stringify(putResponseNoPriority))
// console.log("Request With Priority")
// console.log(JSON.stringify(putRequestWithPriority))
// console.log("Response With Priority")
// console.log(JSON.stringify(putResponseWithPriority))
// console.log("—————————————————————")
// console.log("POST /api/todos/{some_id}")
// console.log("Request Adjust Title")
// console.log(JSON.stringify(postRequestAdjustTitle))
// console.log("Response Adjust Title")
// console.log(JSON.stringify(postResponseAdjustTitle))
// console.log("Request Complete")
// console.log(JSON.stringify(postRequestComplete))
// console.log("Response Complete")
// console.log(JSON.stringify(postResponseComplete))
// console.log("—————————————————————")
// console.log("GET /api/todos/{some_id}")
// console.log(JSON.stringify(todos[0]))

const methods = {
    get: "GET",
    put: "PUT",
    post: "POST"
}

const samples = [
    Sample(methods.get, "/api/todos", null, todos),
    Sample(methods.get, "/api/todos", null, todos.concat([{
        title: "Try out Optic",
        createdAt: Date.now(),
        completed: false,
        priority: "high",
        id: crypto.randomBytes(4).toString("hex")
    }])),
    Sample(methods.put, "/api/todos", putRequestNoPriority, putResponseNoPriority),
    Sample(methods.put, "/api/todos", putRequestWithPriority, putResponseWithPriority),
    Sample(methods.post, `/api/todos/${postResponseAdjustTitle.id}`, postRequestAdjustTitle, postResponseAdjustTitle),
    Sample(methods.post, `/api/todos/${postResponseComplete.id}`, postRequestComplete, postResponseComplete),
    Sample(methods.get, `/api/todos/${todos[0].id}`, null, todos[0]),
]

const format = {
    "events": [],
    "session": {
        "samples": JSON.stringify(samples),
        "metadata": {}
    },
    "examples": {}
}
// console.log(samples)
console.log(JSON.stringify(samples))

function Sample(method, path, requestBody, responseBody) {
    return {
        "uuid": crypto.randomBytes(4).toString("hex"),
        "request": {
            "host": "localhost",
            "method": method,
            "path": path,
            "query": {
                "asJsonString": null,
                "asText": null,
                "asShapeHashBytes": null
            },
            "headers": {
                "asJsonString": null,
                "asText": null,
                "asShapeHashBytes": null
            },
            "body": {
                "contentType": requestBody ? "application/json" : null,
                "value": {
                    "asJsonString": requestBody ? JSON.stringify(requestBody) : null,
                    "asText": null,
                    "asShapeHashBytes": null
                }
            }
        },
        "response": {
            "statusCode": 200,
            "headers": {
                "asJsonString": null,
                "asText": null,
                "asShapeHashBytes": null
            },
            "body": {
                "contentType": "application/json",
                "value": {
                    "asJsonString": responseBody ? JSON.stringify(responseBody) : null,
                    "asText": null,
                    "asShapeHashBytes": null
                }
            }
        },
        "tags": []
    }
}