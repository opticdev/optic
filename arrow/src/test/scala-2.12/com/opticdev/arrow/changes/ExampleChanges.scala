package com.opticdev.arrow.changes

import play.api.libs.json.Json
import JsonImplicits._
import better.files.File
import com.opticdev.core.Fixture.TestBase
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
        |   "gearId": "aacee631",
        |		"_type":"com.opticdev.arrow.changes.InsertModel"
        |	}]
      """.stripMargin

    val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yaml")))
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
        |		"gearId": "aacee631",
        |		"atLocation": {
        |			"file": "test-examples/resources/tmp/test_project/app.js",
        |			"position": 38,
        |			"_type":"com.opticdev.arrow.changes.location.AsChildOf"
        |		},
        |		"_type":"com.opticdev.arrow.changes.InsertModel"
        |	}]
      """.stripMargin

    val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yaml")))
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
        |				"name": "Model -> Route",
        |				"packageId": "optic:test-transform@latest",
        |				"input": "optic:rest@0.1.0/model",
        |				"output": "optic:rest@0.1.0/route",
        |       "ask": {"type": "object"},
        |				"script": "function transform(input) {\n    var routeName = input.name.toLowerCase();\n    var route = \"/\" + routeName;\n\n    var parameters = Object.keys(input.schema).map(function (i) {\n        return {\n            in: 'body',\n            name: i\n        };\n    });\n\n    return {\n        method: \"post\",\n        url: route,\n        parameters: parameters\n    };\n}"
        |			},
        |			"target": "optic:test@latest/route",
        |			"_type": "com.opticdev.arrow.graph.KnowledgeGraphImplicits.DirectTransformation"
        |		},
        |		"gearOptions": [{
        |     "name": "Route",
        |     "packageFull": "optic:expressjs@0.1.0",
        |     "id": "aacee631"
        |   }],
        |   "gearId": "aacee631",
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
     		|   "_type":"com.opticdev.arrow.changes.RunTransformation"
        | }]
      """.stripMargin

      val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yaml")))
        .map(_.inflate)

      val sourcegear = Await.result(future, 10 seconds)

      val changeGroup = Json.fromJson[ChangeGroup](Json.parse(changesJSON)).get


    (changeGroup, sourcegear, "import mongoose from 'mongoose'\n\nconst model = mongoose.model('user', new mongoose.Schema({\n    'firstName': 'string',\n    'lastName': 'string',\n    'email': 'string',\n}))\n\napp.post('/user', function (req, res) {\n  req.body.firstName\n  req.body.lastName\n  req.body.email\n})")

  }

}
