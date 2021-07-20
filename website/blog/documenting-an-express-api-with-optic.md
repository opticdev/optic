---
date: 2021-07-22
title: "Documenting an Express API with Optic"
author: Amarachi Amaechi
author_url: "https://twitter.com/AmarachiAmaechi"
author_image_url: "/img/people/amarachi-amaechi.jpeg"
category: Community
---

Documentation is one of the most important steps in building out an API. A good developer experience requires easy-to-use API documentation containing detailed instructions for navigating a given API endpoint. 

<!-- truncate -->

There are many tools currently available for automating the API documentation process. This article will focus specifically on [Optic](https://useoptic.com/), a powerful and easy-to-use open-source project supporting API documentation and testing.

API documentation can be time-consuming, especially when the API is complicated or growing. Optic aims to solve this problem by providing an easy method for documentation. In this tutorial, you'll learn how to write an Express API using Optic. All the [code used can be found here](https://github.com/amycruz97/optics).

## Express
Starting a server or using middleware in Node.js can be complex and time-consuming. [Express](https://expressjs.com/) is a Node.js framework that simplifies basic operations from routing to running a server. You can get your basic API up and running within a short period of time.

In this tutorial, you'll be building a basic API from scratch while testing and documenting it with Optic.

### Prerequisites
- Node.js, [npm](https://www.npmjs.com/), and Git installed
- Basic knowledge of Node.js and Express
- Knowledge of [MongoDB](https://www.mongodb.com/) and [Mongoose](https://mongoosejs.com/) is helpful but not strictly required
- You should have used the command line before

## Getting Started
You're going to start simple. Below is the file structure you'll use, so you can start by creating these files in your root folder. Give your root folder whatever name you desire. 

```sh title='Project folder structure'
______[ROOT FOLDER]
  |
  |___article.controller.js
  |
  |___Article.js
  |
  |___articleService.js
  |
  |___server.js
  |
  |___article.routes.js
  |
```

You can see that your root folder contains five different files which serve different purposes. Before you move on, let's run the following command:

```
npm init -y
```

Note that the `package.json` file has been set up. The content should look similar to this:

```json title='package.json'
{
    "name": "optics_app",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1"
},
    "keywords": [],
    "author": "",
    "license": "ISC"
  }
```

You'll need different dependencies, including `express`, `nodemon`,  `mongoose`, `body-parser`, and `dotenv`. Go ahead and run the following command to install all these necessary dependencies:

```
npm i --save-dev express nodemon mongoose body-parser dotenv 
```

Check that the dependencies were correctly installed by moving to the `package.json` file and checking under `devDependencies`.

Update your `server.js` file with the following code:

```js title='server.js'
require('dotenv').config();
const express = require("express")
const app = express();
 
const port = process.env.PORT || 8000;
 
app.use(express.json());
 
app.get("/", (req, res) => {
    res.send(`<h1>Hey it's working</h1>`)
});
app.listen(port, () => {
    console.log(`Application is listening at port ${port}`);
});
```

If that's done correctly, you can start your server by running:

```
node server.js
```

Your application should be running at port 3000.

Next is to update the various files that you created before. You'll be learning what each file does as you go.

Update your `server.js` file with the following code:

```js title='server.js'
require('dotenv').config();
const mongoose =  require("mongoose");
const articles = require("./article.routes");
const bodyParser =  require("body-parser");
const express = require("express")
const app = express();
const port = process.env.PORT || 8000;
 
mongoose.connect(process.env.mongoURI, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
.then(res => console.log(`Connection Successful ${res}`))
.catch(err => console.log(`Error in DB connection ${err}`));
 
//body-parser config;
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());
 
app.get("/", (req, res) => {
    res.send(`<h1>Hello!</h1>`)
});
//register the enpoints
app.use("/api/v1/articles", articles);
app.listen(port, () => {
    console.log(`Application is listening at port ${port}`);
});
```

You defined your base route in the previous code and then imported the other routes from the `articles.routes.js` folder, which you have yet to update. Also, note that you created a MongoDB connection.

You can proceed to [MongoDB atlas](https://www.mongodb.com/cloud/atlas/efficiency) to create an account as well as a MongoDB cluster if you have yet to. After that, you can then create a `.env` file and store your MongoDB details, which should look like this:

```
mongodb+srv: <username> : <password> <extended link>
```

Now let's update the remaining files. Update your `article.js` with the following code:

```js title='article.js'
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
 
const articleSchema = Schema({
 
    title:{
        type: String,
        required: true,
    },
 
    body:{
        type: String,
        required: true,
    },
 
    article_image: {
        type: String,
        required: false,
    },
 
    date:{
        type: Date,
        default: Date.now(),
    }

});
  
module.exports = Article = mongoose.model("data", articleSchema);
```

This file contains your defined Mongoose schema.

Update the `articles.routes.js` file:

```js title='articles.routes.js'
const  express =  require("express");
const router = express.Router();
const ArticleCtrl = require("./article.controller");
 
 
router.get("/", ArticleCtrl.apiGetAllArticles);
router.post("/", ArticleCtrl.apiCreateArticle);
router.get("/article/:id", ArticleCtrl.apiGetArticleById);
router.put("/article/:id", ArticleCtrl.apiUpdateArticle);
router.delete("/article/:id", ArticleCtrl.apiDeleteArticle);
 
module.exports =  router;
```

And update the `article.controller.js` file:

```js title='article.controller.js'
const ArticleService = require("./ArticleService");
 
module.exports = class Article{
 
   static async apiGetAllArticles(req, res, next){
       try {
         const articles = await ArticleService.getAllArticles();
         if(!articles){
            res.status(404).json("There are no article published yet!")
         }
         res.json(articles);
       } catch (error) {
          res.status(500).json({error: error})
       }
 
   }
 
   static async apiGetArticleById(req, res, next){
      try {
         let id = req.params.id || {};
         const article = await ArticleService.getArticlebyId(id);
         res.json(article);
      } catch (error) {
         res.status(500).json({error: error})
      }
   }

static async apiCreateArticle(req, res, next){
      try {
         const createdArticle =  await ArticleService.createArticle(req.body);
         res.json(createdArticle);
      } catch (error) {
         res.status(500).json({error: error});
      }
   }
 
   static async apiUpdateArticle(req, res, next){
      try {
         const comment = {}
         comment.title        = req.body.title;
         comment.body         = req.body.body;
         comment.articleImage = req.body.article_image
 
         const updatedArticle = await ArticleService.updateArticle(comment);
 
         if(updatedArticle.modifiedCount === 0){
            throw new Error("Unable to update article, error occord");
         }
 
         res.json(updatedArticle);
 
      } catch (error) {
         res.status(500).json({error: error});
      }
   }
 
   static async apiDeleteArticle(req, res, next){
         try {
            const articleId = req.params.id;
            const deleteResponse =  await ArticleService.deleteArticle(articleId)
            res.json(deleteResponse);
         } catch (error) {
            res.status(500).json({error: error})
         }
 }
 
}
```

Your routes are defined on the `articles.routes.js` file, while the controllers are defined on the `article.controller.js` file. The only file yet to be updated is your articleService.js` file. Go ahead and update it with the following code:

```js title='articles.routes.js'
const Article = require("./Article");
 
module.exports = class ArticleService{
    static async getAllArticles(){
        try {
            const allArticles = await  Article.find();
            return allArticles;
        } catch (error) {
            console.log(`Could not fetch articles ${error}`)
        }
    }
 
    static async createArticle(data){
        try {
 
            const newArticle = {
                title: data.title,
                body: data.body,
                article_image: data.article_image
            }
           const response = await new Article(newArticle).save();
           return response;
        } catch (error) {
            console.log(error);
        } 
 
    }
    static async getArticlebyId(articleId){
        try {
            const singleArticleResponse =  await Article.findById({_id: articleId});
            return singleArticleResponse;
        } catch (error) {
            console.log(`Article not found. ${error}`)
        }
    }
 
    static async updateArticle(title, body, articleImage){
            try {
                const updateResponse =  await Article.updateOne(
                    {title, body, articleImage}, 
                    {$set: {date: new Date.now()}});
 
                    return updateResponse;
            } catch (error) {
                console.log(`Could not update Article ${error}` );
 
        }
    }
 
    static async deleteArticle(articleId){
        try {
            const deletedResponse = await Article.findOneAndDelete(articleId);
            return deletedResponse;
        } catch (error) {
            console.log(`Could  ot delete article ${error}`);
        }
 
    }
}
```

Now let's pause and restart the server. Proceed to `localhost:8000/api/v1/articles`.
You should try making a post request to the above route, and if you've followed the steps correctly so far, the request should go true.

Note that you should revisit the beginning of this article and look for omissions in your own code should you encounter any issues after restarting your server. You can also Google the error message you received for more insight.

## Documentation

Here comes the documentation part. To use Optic effectively, you must first install it globally to your system. To install Optic, run the following command on your terminal:

```
npm install @useoptic/cli -g
```

Next, navigate to your project directory and run the following command to help with basic Optic initialization and setup:

```
api init
```

An `optic.yml` file containing the command used to start your server, as well as the port where your server runs, will be created.

For Optic to work effectively, you need to provide a port as an environment variable. To do this, set your port as follows:

```js title='server.js'
const port = process.env.PORT || 8000;
```

This way, Optic is allowed to set the port for you. You can start your server by running:

```
api start
```

Optic throws a proxy in between your traffic and the actual API process. This will help Optic monitor your API and keep track of changes.

The next step is to exercise your API. You can do this by simply performing GET, POST, PUT, DELETE, and similar requests on your endpoint. This way, Optic can detect your API endpoints. To register all detected routes and review API diffs, proceed to the link for reviewing API diff shown to you when you run `api status` on your terminal.

```sh title='output of api start'
$ api start
[optic] Review the API Diff at http://localhost:34444/apis/1/diffs
[optic] Optic is observing requests made to http://localhost:3001
```

You should be directed to the following page, which tells you that you have **undocumented URLs**. Click through to start documenting this traffic:

![Undocumented endpoints detected](/img/blog-content/documenting-express-unmatched.png)

Go ahead and confirm each of the endpoints as listed on this page. Don't forget to click on the parameterized elements of your URLs and add a descriptive identifier.

![Documenting endpoints](/img/blog-content/documenting-express-document.png)

Save your results, which will take you to the resulting documentation:

![Confirming endpoints](/img/blog-content/documenting-express-documented.png)

Optic automatically generates a summary of each endpoint and the possible response data. Though it's optional, a swagger file can also be generated. 

## Conclusion 

API documentation as you have seen above is much easier with Optic. It does all the big work for you allowing users to focus mainly on the development process of their API. Unlike some other documentation tools available, Optic documents your API while you develop them by observing and registering new endpoints as you create them.

If you want to use Optic as a middleware in your Express stack, you can check out [https://github.com/opticdev/optic-node/tree/main/frameworks/express](https://github.com/opticdev/optic-node/tree/main/frameworks/express). We'd love to get your feedback on the module.

Want to write an Optic library for your framework of choice? Optic is an open-source project, so you can [join the community](https://www.useoptic.com/docs/community/) working hard to make writing documentation easy.
