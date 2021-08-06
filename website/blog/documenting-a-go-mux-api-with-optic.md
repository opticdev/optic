---
date: 2021-08-06
title: "Documenting a Go Mux API with Optic"
author: Eze Sunday
author_url: "https://twitter.com/ezesundayeze"
author_image_url: "/img/people/eze-sunday.jpeg"
category: Community
---

Documenting your software is as important as developing your software. With [maintenance making up 50–70 percent of a system's cost](https://www.researchgate.net/publication/312190273_Reduction_of_software_perfective_and_corrective_maintenance_cost) over its lifetime, it's important to be efficient and clear about how the software was built and how it behaves. If human beings are going to maintain the application, you must document your software.

However, it's a tedious and constantly evolving process, which means you need to always make changes to the documentation each time you make a change to your software codebase. But what if you don't have to worry so much about editing multiple documentation files each time you update your code? What if you could just focus on writing great code?

<!-- truncate -->

That's what [Optic](https://useoptic.com/) does for you. Optic is an API documentation assistant that observes your API development traffic, learns your API behavioral pattern, and automatically creates and updates your API docs for you. You can track every change that happens at every step of the development process. Your team can review your docs the way you'd review your code on GitHub.

In this tutorial, I'll show you how to document an API built with [Go Mux](https://www.gorillatoolkit.org/pkg/mux). Mux is a full-featured router and dispatcher for Go that matches a wide range of requests, based on URL host, schemes, path, path prefix, header and query values, HTTP methods, and regex. This API will have Create, List, Retrieve capabilities, and you'll see how efficient it is to build and maintain an API with Optic.

## Setting Up the API

First, let's go over the prerequisites for setting up this API on your machine:
- You must have [Go](https://golang.org/) installed. You can [download](https://golang.org/dl/) and install it if you haven't already.
- You must have [Node v12+](https://nodejs.org) installed

To begin, create a file, name it `app.go`, and add the following code to it:

```go title='app.go'
package main

import (
   "encoding/json"
   "fmt"
   "io/ioutil"
   "log"
   "net/http"
   "os"

   "github.com/gorilla/mux"
)



func handleRequests() {
   router := mux.NewRouter()
   port := os.Getenv("PORT")
   router.HandleFunc("/", home).Methods("GET")

   // handle all routes
   router.HandleFunc("/post/list", getAllPosts).Methods("GET")
   router.HandleFunc("/post/{id}", getSinglePost).Methods("GET")
   router.HandleFunc("/post/create", createNewPost).Methods("POST")

   log.Fatal(http.ListenAndServe(":"+port, router))
}

type Post struct {
   Id string `json:"Id"`
   Title string `json:"Title"`
   Desc string `json:"desc"`
   Content string `json:"content"`
}

// Since we are not using a real database, we'll use an array to simulate a database
// Create a global post array that we can populate and manipulate.

var Posts []Post

func main() {
   fmt.Println("Go API - Mux Routers")

   Posts = []Post{
       Post{Id: "1", Title: "How to buy burger online", Desc: "You'll learn how to buy burger online", Content: "Buying burger online is easy, just buy it"},
       Post{Id: "2", Title: "How to avoid scammers", Desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit", Content: "Duis aute irure dolor in reprehenderit in voluptate velit"},
   }
   handleRequests()
}


func home(w http.ResponseWriter, r *http.Request) {
   fmt.Fprintf(w, "Welcome to the HomePage Route")
   fmt.Println("Route: /")
}

func getAllPosts(w http.ResponseWriter, r *http.Request) {
   fmt.Println("Route: /post/list")
   json.NewEncoder(w).Encode(Posts)
}

func getSinglePost(w http.ResponseWriter, r *http.Request) {
   vars := mux.Vars(r)
   key := vars["id"]

   for _, Post := range Posts {
       if Post.Id == key {
           json.NewEncoder(w).Encode(Post)
       }
   }
}

func createNewPost(w http.ResponseWriter, r *http.Request) {
   reqBody, _ := ioutil.ReadAll(r.Body)
   var Post Post
   json.Unmarshal(reqBody, &Post)

   Posts = append(Posts, Post)
   json.NewEncoder(w).Encode(Post)
}
```
The code above is the API. For simplicity, it was built without a database. I used an array to serve as the database as seen here:

```go title='Posts database'
Posts = []Post{
       Post{Id: "1", Title: "How to buy burger online", Desc: "You'll learn how to buy burger online", Content: "Buying burger online is easy, just buy it"},
       Post{Id: "2", Title: "How to avoid scammers", Desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit", Content: "Duis aute irure dolor in reprehenderit in voluptate velit"},
   }
```

Also, we're using the Mux library to handle request routing:
 
```go title='Mux library'
func handleRequests() {
   router := mux.NewRouter()
   port := os.Getenv("PORT")
   router.HandleFunc("/", home).Methods("GET")

   // handle all routes
   router.HandleFunc("/post/list", getAllPosts).Methods("GET")
   router.HandleFunc("/post/{id}", getSinglePost).Methods("GET")
   router.HandleFunc("/post/create", createNewPost).Methods("POST")

   log.Fatal(http.ListenAndServe(":"+port, router))
}
```

Since Mux is an external library, you'll need to install it by running the following command on your terminal:

```sh
go get -u github.com/gorilla/mux
```

Mux is a powerful router for Go with lots of exciting features like matching dynamic (`router.Host("{subdomain:[a-z]+}.example.com")`) and exact routes (`router.Host("www.example.com")`). It has several ways of handling routing, but in this case, you'll be using the static routes as shown in the example code mentioned earlier.

After adding Mux, you can go ahead and run the application.

```sh
go run app.go
```

You should see something like this on your terminal:

```sh
Go API - Mux Routers
```

Now, you can access the API with Postman, as shown in the following image:

![API request with Postman example](https://i.imgur.com/s1iSxKE.png)

The routes below are the routes we'll be documenting with Optic:

```Go title='Routes'
   router.HandleFunc("/post/list", getAllPosts).Methods("GET")
   router.HandleFunc("/post/{id}", getSinglePost).Methods("GET")
   router.HandleFunc("/post/create", createNewPost).Methods("POST")
```

Now, let's add Optic to your workflow.

## Adding Optic to Your Mux API Workflow

For Optic to do its job effectively, it needs to integrate into your Mux API. So, let's  go over how you can make that integration.

The first step to adding Optic to your application is to install its Command Line Interface (CLI). There are three ways to install the Optic CLI:

- With [npm](https://www.npmjs.com/). 
    ```bash
    npm install @useoptic/cli -g
    ```
- With [Yarn](https://yarnpkg.com/). 
    ```bash
    yarn global add @useoptic/cli
    ```
- With [brew](https://brew.sh/), if you are a MacOS Or Linux machine user.
    ```bash
    brew install opticdev/optic/api
    ```

When the installation is complete, make sure you're in your project's root directory. The CLI command is `api`. So, run `api init` to initialize Optic in your API. It should generate a few files, including an `optic.yml` file. We'll update the command from `echo \"Setup A Valid Command to Start your API!\"` to `go run app.go`:

```yaml title='optic.yml'
name: "Go Mux API"
tasks:
 start:
    command: "go run app.go"
    inboundUrl: http://localhost:4000
```

We'll also change the port `4000` to use the port that will be generated from `$PORT` in your environment variable (Optic provides `$PORT` as an environment variable which you can access in your code) as shown in the code posted earlier.

```go title='app.go'
   port := os.Getenv("PORT")
```

Once you do that, you'll have to start your app with `api start` instead of `go run app.go`. So, run it:

```sh
api start
```

You should see something like this if everything went well:

```sh
[optic] Review the API Diff at http://localhost:34444/apis/1/diffs
[optic] Optic is observing requests made to http://localhost:4000
Go API - Mux Routers
```

Optic will start observing every activity that happens on `http://localhost:4000`, and it will create a diff log for you to review in route `http://localhost:34444/apis/1/diffs`.

So, the first thing you should do is send a request to the APIs you've created using Postman. Send a request to:

- http://localhost:4000/post/list
- http://localhost:4000/post/1
- http://localhost:4000/post/create

Then check the documentation review dashboard. It should look like this:

![Documentation Review Dashboard](/img/blog-content/documenting-go-mux-diffs.png)

Click through to start documenting your API. Start with any static routes, such as `/post/list`, then move on to parameterized routes, like the `/post/1/` route. You can edit it and add the meaning of `1`, which is id, and it should look like the following image:

![Edited Review](/img/blog-content/documenting-go-mux-learn.png)

Next, click the **Save Changes** button. Now, you can enter the commit message for this change and apply the changes.

Done? Cool. You'll be redirected to the documentation page, where you can edit the title and add detailed descriptions to each route.

![Documentation](/img/blog-content/documenting-go-mux-documentation.png)

If you click on one of the route's documents, it'll take you to a page where you can find more information about the route. It should look like this:

![Document Sample](/img/blog-content/documenting-go-mux-detail.png)

You didn't write all that, right?
Yeah, that's the beauty of Optic.

Now, let's make a change to our API and see how Optic will react to it.

In our use case, I made a change to the Post struct and made another request to the API. I changed `content` to `contents`.

```go title='app.go' {5}
type Post struct {
   Id string `json:"Id"`
   Title string `json:"Title"`
   Desc string `json:"desc"`
   Content string `json:"contents"` // This line changed `content` to `contents`
}
```

Optic observed that something changed in the API traffic:

![API Docs Change Log](/img/blog-content/documenting-go-mux-diff-detail.png)

I can decide whether to approve it or to mark it as incorrect, make the changes and come back to make it right. If I approve it, it updates the existing endpoint.

As you can see, setting up and using Optic in your Go Mux application is a straightforward process. 

## Conclusion

The importance of documenting your API can not be overemphasized. If you write an application whose code only you understand, its lifetime will be short. No one else will be able to make changes to it, or at minimum, it will be difficult to do.

The investment that goes into writing documentation for your API is a long-term one that will pay off. Want to write an Optic library for Go? Optic is an open-source project, so you can [join the community](https://www.useoptic.com/docs/community/) working hard to make writing documentation easy.
