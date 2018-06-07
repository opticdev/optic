package com.opticdev.arrow.changes

import play.api.libs.json.Json
import JsonImplicits._
import akka.actor.ActorSystem
import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.core.sourcegear.{SGConstructor, SourceGear}
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.opm.TestPackageProviders

import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Await
object ExampleChanges extends TestBase with TestPackageProviders {

  beforeAll
  installProviders

  lazy val simpleModelInsert : (ChangeGroup, SourceGear, String)= {
    val exampleChangesJSON =
      """
        | [{
        |		"schema": {
        |			"title": "Route",
        |			"version": "1.0.0",
        |			"type": "object",
        |			"required": ["method", "url"],
        |			"properties": {
        |				"method": {
        |					"type": "string"
        |				},
        |				"url": {
        |					"type": "string"
        |				},
        |				"parameters": {
        |					"type": "array",
        |					"items": {
        |						"$ref": "#/definitions/parameter"
        |					}
        |				}
        |			},
        |			"definitions": {
        |				"parameter": {
        |					"title": "Parameter",
        |					"version": "1.0.0",
        |					"slug": "js-example-route-parameter",
        |					"type": "object",
        |					"required": ["method"],
        |					"properties": {
        |						"in": {
        |							"type": "string"
        |						},
        |						"name": {
        |							"type": "string"
        |						}
        |					}
        |				}
        |			},
        |			"_identifier": "optic:rest@0.1.0/route"
        |		},
        |		"value": {
        |			"method": "post",
        |			"url": "path/to/resource"
        |		},
        |		"atLocation": {
        |			"file": "test-examples/resources/tmp/test_project/app.js",
        |			"position": 93,
        |			"_type":"com.opticdev.arrow.changes.location.AsChildOf"
        |		},
        |   "lensId": "optic:express-js/route",
        |   "answers": {},
        |		"_type":"com.opticdev.arrow.changes.InsertModel"
        |	}]
      """.stripMargin

    val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yml")))
      .map(_.inflate)

    val sourcegear = Await.result(future, 10 seconds)

    val changeGroup = Json.fromJson[ChangeGroup](Json.parse(exampleChangesJSON)).get

    val expectedChange = "let first = require('second')\n\napp.get('user/:id', function (req, res) {\n    req.query.id\n})\n\napp.post('path/to/resource', function (req, res) {\n\n})\n\napp.get('post/:id', function (req, res) {\n    req.query.id\n})"

    (changeGroup, sourcegear, expectedChange)
  }


  lazy val insertFromSearch = {
    val changesJSON =
      """
        |[{
        |		"schema": {
        |			"title": "Route",
        |			"version": "1.0.0",
        |			"type": "object",
        |			"required": ["method", "url"],
        |			"properties": {
        |				"method": {
        |					"type": "string"
        |				},
        |				"url": {
        |					"type": "string"
        |				},
        |				"parameters": {
        |					"type": "array",
        |					"items": {
        |						"$ref": "#/definitions/parameter"
        |					}
        |				}
        |			},
        |			"definitions": {
        |				"parameter": {
        |					"title": "Parameter",
        |					"version": "1.0.0",
        |					"slug": "js-example-route-parameter",
        |					"type": "object",
        |					"required": ["method"],
        |					"properties": {
        |						"in": {
        |							"type": "string"
        |						},
        |						"name": {
        |							"type": "string"
        |						}
        |					}
        |				}
        |			},
        |			"_identifier": "optic:rest@0.1.0/route"
        |		},
        |		"value": {
        |			"method": "post",
        |			"url": "test/url"
        |		},
        |		"lensId": "optic:express-js/route",
        |		"atLocation": {
        |			"file": "test-examples/resources/tmp/test_project/app.js",
        |			"position": 38,
        |			"_type":"com.opticdev.arrow.changes.location.AsChildOf"
        |		},
        |   "answers": {},
        |		"_type":"com.opticdev.arrow.changes.InsertModel"
        |	}]
      """.stripMargin

    val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yml")))
      .map(_.inflate)

    val sourcegear = Await.result(future, 10 seconds)

    val changeGroup = Json.fromJson[ChangeGroup](Json.parse(changesJSON)).get

    val stagedContent =
      """let first = require('second')
        |///route
        |app.get('user/:id', function (req, res) {
        |    req.query.id
        |})
        |
        |app.get('post/:id', function (req, res) {
        |    req.query.id
        |})
        |
      """.stripMargin


    val expectedChange = "let first = require('second')\n\napp.post('test/url', function (req, res) {\n\n})\n///route\napp.get('user/:id', function (req, res) {\n    req.query.id\n})\n\napp.get('post/:id', function (req, res) {\n    req.query.id\n})\n\n      "

    (changeGroup, sourcegear, stagedContent, expectedChange)

  }

  lazy val transformModelToRoute = {

    val changesJSON =

      """
        |[{
        |		"transformationChanges": {
        |			"transformation": {
        |				"yields": "Model -> Route",
        |				"id": "m2r",
        |				"packageId": "optic:test-transform@latest",
        |				"input": "optic:rest@0.1.0/model",
        |				"output": "optic:rest@0.1.0/route",
        |       "ask": {"type": "object"},
        |       "dynamicAsk": {},
        |				"script": "function transform(input) {\n    var routeName = input.name.toLowerCase();\n    var route = \"/\" + routeName;\n\n    var parameters = Object.keys(input.schema).map(function (i) {\n        return {\n            in: 'body',\n            name: i\n        };\n    });\n\n    return {\n        method: \"post\",\n        url: route,\n        parameters: parameters\n    };\n}"
        |			},
        |			"target": "optic:test@latest/route",
        |			"_type": "com.opticdev.arrow.graph.KnowledgeGraphImplicits.DirectTransformation"
        |		},
        |		"lensOptions": [{
        |     "name": "Route",
        |     "packageFull": "optic:expressjs@0.1.0",
        |     "id": "85c0d9c3"
        |   }],
        |   "askSchema": {"type": "object"},
        |   "lensId": "optic:express-js/route",
        | 	"locationOptions": [{
        |		  "file": "test-examples/resources/tmp/test_project/nested/model.js",
        |		  "position": 173,
        |		  "_type": "com.opticdev.arrow.changes.location.AsChildOf"
        |  	}],
        |   "location": {
        |		  "file": "test-examples/resources/tmp/test_project/nested/model.js",
        |		  "position": 173,
        |		  "_type": "com.opticdev.arrow.changes.location.AsChildOf"
        |  	},
        |   "inputValue": {"name": "user", "schema": { "firstName": { "type": "string"}, "lastName": { "type": "string"}, "email": { "type": "string"} }},
        |   "answers": {},
     		|   "_type":"com.opticdev.arrow.changes.RunTransformation"
        | }]
      """.stripMargin

      val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yml")))
        .map(_.inflate)

      val sourcegear = Await.result(future, 10 seconds)

      val changeGroup = Json.fromJson[ChangeGroup](Json.parse(changesJSON)).get


    (changeGroup, sourcegear, "import mongoose from 'mongoose'\n\nconst model = mongoose.model('user', new mongoose.Schema({\n    'firstName': 'string',\n    'lastName': 'string',\n    'email': 'string',\n}))\n\napp.post('/user', function (req, res) {\n  req.body.firstName\n  req.body.lastName\n  req.body.email\n})")

  }

  lazy val nestedTransformModelToRoute = {

    val changesJSON =

      """
        |[{
        |		"transformationChanges": {
        |			"transformation": {
        |				"yields": "Schema -> Create Route",
        |       "id": "s2r",
        |				"packageId": "optic:mongoose@0.1.0",
        |				"input": "optic:mongoose@0.1.0/schema",
        |				"output": "optic:rest@0.1.0/route",
        |       "dynamicAsk": {},
        |				"ask": {
        |					"type": "object",
        |					"properties": {
        |						"queryProvider": {
        |							"description": "The gear you want to use to resolve this query",
        |							"type": "string",
        |							"_opticValidation": {
        |								"accepts": "lens",
        |								"withSchema": "optic:mongoose@0.1.0/create-record"
        |							}
        |						}
        |					},
        |					"_order": ["queryProvider"],
        |					"required": ["queryProvider"]
        |				},
        |				"script": "function transform(input, answers) {\n var routeName = input.name.toLowerCase();\n    var route = \"/\" + routeName;\n\n    var parameters = Object.keys(input.schema).map(function (i) {\n        return {\n            in: 'body',\n            name: i\n        };\n    });\n\n  var routeDescription = {\n        method: \"post\",\n        url: route,\n        parameters: parameters\n    };\n\n   var queryDescription = {\n        fields: Object.keys(input.schema).reduce(function (previous, current) {\n            previous[current] = Generate('optic:rest/parameter', { in: 'body', name: current });\n            return previous;\n        }, {})\n    };\n\n  return Generate(answers.output, routeDescription, {\n        containers: {\n            \"callback\": [Generate('optic:mongoose/create-record', queryDescription, { \n lensId: answers.queryProvider \n  })]\n        }\n    });\n}"
        |			},
        |			"target": "optic:rest@0.1.0/route",
        |			"_type": "com.opticdev.arrow.graph.KnowledgeGraphImplicits.DirectTransformation"
        |		},
        |   "askSchema": {
        |					"type": "object",
        |					"properties": {
        |						"queryProvider": {
        |							"description": "The gear you want to use to resolve this query",
        |							"type": "string",
        |							"_opticValidation": {
        |								"accepts": "lens",
        |								"withSchema": "optic:mongoose@0.1.0/create-record"
        |							}
        |						}
        |      }
        |		},
        |		"inputValue": {
        |			"schema": {
        |				"firstName": "string",
        |				"lastName": "string",
        |				"email": "string",
        |				"_order": ["firstName", "lastName", "email"]
        |			},
        |			"name": "Hello",
        |     "_variables": { "modelName": "model" }
        |		},
        |		"lensOptions": [{
        |			"name": "Route",
        |			"packageFull": "optic:express-js@0.1.0",
        |			"id": "85c0d9c3"
        |		}],
        |		"locationOptions": [{
        |			"file": "test-examples/resources/tmp/test_project/nested/model.js",
        |		  "position": 173,
        |		  "_type": "com.opticdev.arrow.changes.location.AsChildOf"
        |		}],
        |		"_type": "com.opticdev.arrow.changes.RunTransformation",
        |		"lensId": "optic:express-js/route",
        |		"location": {
        |			"file": "test-examples/resources/tmp/test_project/nested/model.js",
        |		  "position": 173,
        |		  "_type": "com.opticdev.arrow.changes.location.AsChildOf"
        |		},
        |		"answers": {
        |			"queryProvider": "optic:mongoose/insert-record"
        |		}
        |	}]
      """.stripMargin

    val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yml")))
      .map(_.inflate)

    val sourcegear = Await.result(future, 10 seconds)

    val changeGroup = Json.fromJson[ChangeGroup](Json.parse(changesJSON)).get

    (changeGroup, sourcegear, "import mongoose from 'mongoose'\n\nconst model = mongoose.model('user', new mongoose.Schema({\n    'firstName': 'string',\n    'lastName': 'string',\n    'email': 'string',\n}))\n\napp.post('/hello', function (req, res) {\n  new model({ firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email }).save((err, item) => {\n    if (!err) {\n    \n    } else {\n    \n    }\n  })\n})")

  }


  lazy val transformationFromSearch = {

    val changesJSON =
      """[{
        |	"transformationChanges": {
        |		"transformation": {
        |			"yields": "Create Route",
        |			"id": "cr",
        |			"packageId": "optic:mongoose@0.1.0",
        |			"input": "optic:mongoose@0.1.0/schema",
        |			"output": "optic:rest@0.1.0/route",
        |			"ask": {
        |				"type": "object",
        |				"properties": {},
        |				"_order": []
        |			},
        |			"script": "function transform(input) {\n    var routeName = input.name.toLowerCase();\n    var route = \"/\" + routeName;\n\n    var parameters = Object.keys(input.schema).map(function (i) {\n        return {\n            in: 'body',\n            name: i\n        };\n    });\n\n    return {\n        method: \"post\",\n        url: route,\n        parameters: parameters\n    };\n}"
        |		},
        |		"target": "optic:rest@0.1.0/route",
        |		"_type": "com.opticdev.arrow.graph.KnowledgeGraphImplicits.DirectTransformation"
        |	},
        |	"lensOptions": [{
        |		"name": "Route",
        |		"packageFull": "optic:express-js@0.1.0",
        |		"id": "1eac58c9"
        |	}],
        |	"locationOptions": [{
        |		"file": "test-examples/resources/tmp/test_project/app.js",
        |		"position": 93,
        |		"_type": "com.opticdev.arrow.changes.location.AsChildOf"
        |	}],
        | "location": {
        |		"file": "test-examples/resources/tmp/test_project/app.js",
        |		"position": 93,
        |		"_type": "com.opticdev.arrow.changes.location.AsChildOf"
        |	},
        |	"objectOptions": [{
        |		"id": "a520740e",
        |		"value": {
        |			"name": "Hello",
        |			"schema": {
        |				"first": "string",
        |				"last": "string",
        |				"isAdmin": "boolean",
        |				"_order": ["first", "last", "isAdmin"]
        |			}
        |		},
        |		"name": "schema(name: \"Hello\", schema: {4 fields})"
        |	}],
        |	"_type": "com.opticdev.arrow.changes.RunTransformation",
        |	"answers": {},
        |	"objectSelection": "Hello",
        |	"inputValue": {
        |		"name": "Hello",
        |		"schema": {
        |			"first": "string",
        |			"last": "string",
        |			"isAdmin": "boolean",
        |			"_order": ["first", "last", "isAdmin"]
        |		}
        |	}
        |}]""".stripMargin

    val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yml")))
      .map(_.inflate)

    val sourcegear = Await.result(future, 10 seconds)

    val changeGroup = Json.fromJson[ChangeGroup](Json.parse(changesJSON)).get

    (changeGroup, sourcegear, "import mongoose from 'mongoose'\n\nconst model = mongoose.model('user', new mongoose.Schema({\n    'firstName': 'string',\n    'lastName': 'string',\n    'email': 'string',\n}))\n\napp.post('/hello', function (req, res) {\n  new model({ firstName: req.body.firstName,\n  lastName: req.body.lastName,\n  email: req.body.email }).save((err, item) => {\n    if (!err) {\n    \n    } else {\n    \n    }\n  })\n})")

  }

  lazy val mutationTransformationAnyRouteToPostRoute = {

    val changesJSON =

      """
        |[{
        |		"transformationChanges": {
        |			"transformation": {
        |				"yields": "Any Route to Post Route",
        |				"id": "a2p",
        |				"packageId": "optic:test-transform@latest",
        |				"input": "optic:rest@0.1.0/route",
        |				"output": "optic:rest@0.1.0/route",
        |       "ask": {"type": "object"},
        |       "dynamicAsk": {},
        |				"script": "function transform(input) {\n return Mutate('test123', {method: 'post', url: input.url})   \n}"
        |			},
        |			"target": "optic:test@latest/route",
        |			"_type": "com.opticdev.arrow.graph.KnowledgeGraphImplicits.DirectTransformation"
        |		},
        |		"lensOptions": [{
        |     "name": "Route",
        |     "packageFull": "optic:expressjs@0.1.0",
        |     "id": "85c0d9c3"
        |   }],
        |   "askSchema": {"type": "object"},
        |   "lensId": "optic:express-js/route",
        | 	"locationOptions": [{
        |		  "file": "test-examples/resources/test_project/nested/testMutationTransform.js",
        |		  "position": 173,
        |		  "_type": "com.opticdev.arrow.changes.location.AsChildOf"
        |  	}],
        |   "location": {
        |		  "file": "test-examples/resources/test_project/nested/testMutationTransform.js",
        |		  "position": 173,
        |		  "_type": "com.opticdev.arrow.changes.location.AsChildOf"
        |  	},
        |   "inputValue": {"url": "user/:id", "method": "get"},
        |   "answers": {},
        		|   "_type":"com.opticdev.arrow.changes.RunTransformation"
        | }]
      """.stripMargin

    val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yml")))
      .map(_.inflate)

    val sourcegear = Await.result(future, 10 seconds)

    implicit val actorCluster = new ActorCluster(ActorSystem("testone"))

    val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/example_source/"), sourcegear)

    val changeGroup = Json.fromJson[ChangeGroup](Json.parse(changesJSON)).get

    (changeGroup, sourcegear, project, "app.post('user/:id', function (req, res) {\n    req.query.id\n})")

  }

}
