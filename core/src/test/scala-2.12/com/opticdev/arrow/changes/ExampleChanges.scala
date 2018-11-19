package com.opticdev.arrow.changes

import play.api.libs.json.{JsObject, Json}
import JsonImplicits._
import akka.actor.ActorSystem
import better.files.File
import com.opticdev.arrow.changes.location.AsChildOf
import com.opticdev.common.SchemaRef
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.core.sourcegear.{SGConstructor, SourceGear}
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.opm.TestPackageProviders
import com.opticdev.sdk.descriptions.transformation.{Transformation, TransformationRef}

import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Await
object ExampleChanges extends TestBase with TestPackageProviders {

  beforeAll
  installProviders

  lazy val simpleModelInsert : (ChangeGroup, SourceGear, String)= {

    val insertModel = InsertModel(
      SchemaRef.fromString("optic:rest@0.4.0/route").get,
      None,
      Json.parse("""{"method": "post", "url": "path/to/resource"}""").as[JsObject],
      AsChildOf(File("test-examples/resources/tmp/test_project/app.js"), 93)
    )

    val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yml")))
      .map(_.inflate)

    val sourcegear = Await.result(future, 10 seconds)

    val changeGroup = ChangeGroup(insertModel)

    val expectedChange = "let first = require('second')\n\napp.get('user/:id', function (req, res) {\n    req.query.id\n})\n\napp.post('path/to/resource', (req, res) => {\n\n})\n\napp.get('post/:id', function (req, res) {\n    req.query.id\n})"

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
        |		"generatorId": "optic:express-js/route",
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

    val runTransformation = RunTransformation(
      TransformationRef.fromString("optic:mongoose@0.4.0/create-route-from-schema").get,
      Json.parse("""{"name": "user", "schema": { "firstName": { "type": "string"}, "lastName": { "type": "string"}, "email": { "type": "string"} }}""").as[JsObject],
      "test",
      "abcdefg",
      None,
      AsChildOf(File("test-examples/resources/tmp/test_project/nested/model.js"), 173),
      None
    )

    val changeGroup = ChangeGroup(runTransformation)

    val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yml")))
        .map(_.inflate)

    val sourcegear = Await.result(future, 10 seconds)

    (changeGroup, sourcegear, "import mongoose from 'mongoose'\n\nconst model = mongoose.model('user', new mongoose.Schema({\n    'firstName': 'string',\n    'lastName': 'string',\n    'email': 'string',\n}))\n\napp.post('/user', (req, res) => {  //optic.source =  \"abcdefg\" -> optic:mongoose/create-route-from-schema \n  new ModelName({ firstName: req.body['firstName'], lastName: req.body['lastName'], email: req.body['email'] }).save((err, item) => {  //optic.tag = \"query\"\n    if (!err) {\n        res.status(200).send(item)\n    } else {\n        res.status(400).send(err)\n    }\n  })\n})")

  }


//  lazy val mutationTransformationAnyRouteToPostRoute = {
//
//    val changesJSON =
//
//      """
//        |[{
//        |		"transformationChanges": {
//        |			"transformation": {
//        |				"yields": "Any Route to Post Route",
//        |				"id": "a2p",
//        |				"packageId": "optic:test-transform@latest",
//        |				"input": "optic:rest@0.1.0/route",
//        |       "ask": {"type": "object"},
//        |       "dynamicAsk": {},
//        |				"script": "function transform(input, answers, inputModelId) {\n return Mutate(inputModelId, {method: 'post', url: input.url})   \n}"
//        |			},
//        |			"target": "optic:test@latest/route",
//        |			"_type": "com.opticdev.arrow.graph.KnowledgeGraphImplicits.DirectTransformation"
//        |		},
//        |		"lensOptions": [{
//        |     "name": "Route",
//        |     "packageFull": "optic:expressjs@0.1.0",
//        |     "id": "85c0d9c3"
//        |   }],
//        |   "inputModelId": "test123",
//        |   "askSchema": {"type": "object"},
//        |   "generatorId": "optic:express-js/route",
//        | 	"locationOptions": [{
//        |		  "file": "test-examples/resources/tmp/test_project/nested/testMutationTransform.js",
//        |		  "position": 173,
//        |		  "_type": "com.opticdev.arrow.changes.location.AsChildOf"
//        |  	}],
//        |   "location": {
//        |		  "file": "test-examples/resources/tmp/test_project/nested/testMutationTransform.js",
//        |		  "position": 173,
//        |		  "_type": "com.opticdev.arrow.changes.location.AsChildOf"
//        |  	},
//        |   "inputValue": {"url": "user/:id", "method": "get"},
//        |   "answers": {},
//        		|   "_type":"com.opticdev.arrow.changes.RunTransformation"
//        | }]
//      """.stripMargin
//
//    val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yml")))
//      .map(_.inflate)
//
//    val sourcegear = Await.result(future, 10 seconds)
//
//    implicit val actorCluster = new ActorCluster(ActorSystem("testone"))
//
//    val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/example_source/"), sourcegear)
//
//    val changeGroup = Json.fromJson[ChangeGroup](Json.parse(changesJSON)).get
//
//    (changeGroup, sourcegear, project, "app.post('user/:id', function (req, res) {\n    req.query.id\n})\n\n\n\n\n")
//
//  }
//
//  lazy val multiTransformation = {
//
//    val changesJSON =
//
//      """
//        |[{
//        |		"transformationChanges": {
//        |			"transformation": {
//        |				"yields": "multitransformation",
//        |				"id": "a2p",
//        |				"packageId": "optic:test-transform@latest",
//        |				"input": "optic:rest@0.1.0/route",
//        |       "ask": {"type": "object"},
//        |       "dynamicAsk": {},
//        |				"script": "function transform(input, answers, inputModelId) {\n return [Mutate(inputModelId, {method: 'post', url: input.url}), Generate('optic:rest/parameter', { in: 'body', name: 'aidan' }), Generate('optic:rest/parameter', { in: 'body', name: 'lastName' })]   \n}"
//        |			},
//        |			"target": "optic:test@latest/route",
//        |			"_type": "com.opticdev.arrow.graph.KnowledgeGraphImplicits.DirectTransformation"
//        |		},
//        |		"lensOptions": [{
//        |     "name": "Route",
//        |     "packageFull": "optic:expressjs@0.1.0",
//        |     "id": "85c0d9c3"
//        |   }],
//        |   "inputModelId": "test123",
//        |   "askSchema": {"type": "object"},
//        |   "generatorId": "optic:express-js/route",
//        | 	"locationOptions": [{
//        |		  "file": "test-examples/resources/tmp/test_project/nested/testMutationTransform.js",
//        |		  "position": 65,
//        |		  "_type": "com.opticdev.arrow.changes.location.AsChildOf"
//        |  	}],
//        |   "location": {
//        |		  "file": "test-examples/resources/tmp/test_project/nested/testMutationTransform.js",
//        |		  "position": 65,
//        |		  "_type": "com.opticdev.arrow.changes.location.AsChildOf"
//        |  	},
//        |   "inputValue": {"url": "user/:id", "method": "get"},
//        |   "answers": {},
//        		|   "_type":"com.opticdev.arrow.changes.RunTransformation"
//        | }]
//      """.stripMargin
//
//    implicit val actorCluster = new ActorCluster(ActorSystem("testMutation"))
//
//    val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yml")))
//      .map(_.inflate)
//
//    val sourcegear = Await.result(future, 10 seconds)
//
//    val project = new StaticSGProject("test222", File(getCurrentDirectory + "/test-examples/resources/tmp/example_source/"), sourcegear)
//
//    val changeGroup = Json.fromJson[ChangeGroup](Json.parse(changesJSON)).get
//
//    (changeGroup, sourcegear, project, "app.post('user/:id', function (req, res) {\n    req.query.id\n})\n\nreq.body.aidan\n\nreq.body.lastName\n\n\n\n\n")
//
//  }
//
//  lazy val transformAndAddToAnotherFile = {
//
//    val changesJSON =
//
//      """
//        |[{
//        |		"transformationChanges": {
//        |			"transformation": {
//        |				"yields": "Schema -> Create Route",
//        |       "id": "s2r",
//        |				"packageId": "optic:mongoose@0.1.0",
//        |				"input": "optic:mongoose@0.1.0/schema",
//        |				"output": "optic:rest@0.1.0/route",
//        |       "dynamicAsk": {},
//        |				"ask": {
//        |					"type": "object",
//        |					"properties": {
//        |						"queryProvider": {
//        |							"description": "The gear you want to use to resolve this query",
//        |							"type": "string",
//        |							"_opticValidation": {
//        |								"accepts": "lens",
//        |								"withSchema": "optic:mongoose@0.1.0/create-record"
//        |							}
//        |						}
//        |					},
//        |					"_order": ["queryProvider"],
//        |					"required": ["queryProvider"]
//        |				},
//        |				"script": "function transform(input, answers) {\n var routeName = input.name.toLowerCase();\n    var route = \"/\" + routeName;\n\n    var parameters = Object.keys(input.schema).map(function (i) {\n        return {\n            in: 'body',\n            name: i\n        };\n    });\n\n  var routeDescription = {\n        method: \"post\",\n        url: route,\n        parameters: parameters\n    };\n\n   var queryDescription = {\n        fields: Object.keys(input.schema).reduce(function (previous, current) {\n            previous[current] = Generate('optic:rest/parameter', { in: 'body', name: current });\n            return previous;\n        }, {})\n    };\n\n  return Generate(answers.output, routeDescription, { \n inFile: 'test-examples/resources/tmp/test_project/nested/notHereYet.js', \n \n       containers: {\n            \"callback\": [Generate('optic:mongoose/create-record', queryDescription, { \n generatorId: answers.queryProvider \n  })]\n        }\n    });\n}"
//        |			},
//        |			"target": "optic:rest@0.1.0/route",
//        |			"_type": "com.opticdev.arrow.graph.KnowledgeGraphImplicits.DirectTransformation"
//        |		},
//        |   "askSchema": {
//        |					"type": "object",
//        |					"properties": {
//        |						"queryProvider": {
//        |							"description": "The gear you want to use to resolve this query",
//        |							"type": "string",
//        |							"_opticValidation": {
//        |								"accepts": "lens",
//        |								"withSchema": "optic:mongoose@0.1.0/create-record"
//        |							}
//        |						}
//        |      }
//        |		},
//        |		"inputValue": {
//        |			"schema": {
//        |				"firstName": "string",
//        |				"lastName": "string",
//        |				"email": "string",
//        |				"_order": ["firstName", "lastName", "email"]
//        |			},
//        |			"name": "Hello",
//        |     "_variables": { "modelName": "model" }
//        |		},
//        |		"lensOptions": [{
//        |			"name": "Route",
//        |			"packageFull": "optic:express-js@0.1.0",
//        |			"id": "85c0d9c3"
//        |		}],
//        |		"locationOptions": [{
//        |			"file": "test-examples/resources/tmp/test_project/nested/model.js",
//        |		  "position": 173,
//        |		  "_type": "com.opticdev.arrow.changes.location.AsChildOf"
//        |		}],
//        |		"_type": "com.opticdev.arrow.changes.RunTransformation",
//        |		"generatorId": "optic:express-js/route",
//        |		"location": {
//        |			"file": "test-examples/resources/tmp/test_project/nested/model.js",
//        |		  "position": 173,
//        |		  "_type": "com.opticdev.arrow.changes.location.AsChildOf"
//        |		},
//        |		"answers": {
//        |			"queryProvider": "optic:mongoose/insert-record"
//        |		}
//        |	}]
//      """.stripMargin
//
//    val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yml")))
//      .map(_.inflate)
//
//    implicit val actorCluster = new ActorCluster(ActorSystem("testFileInsertion"))
//
//    val sourcegear = Await.result(future, 10 seconds)
//
//    val project = new StaticSGProject("test3333", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourcegear)
//
//    val changeGroup = Json.fromJson[ChangeGroup](Json.parse(changesJSON)).get
//
//    (changeGroup, sourcegear, project, "app.post('/hello', function (req, res) {\n  new model({ firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email }).save((err, item) => {\n    if (!err) {\n    \n    } else {\n    \n    }\n  })\n})")
//
//  }


}
