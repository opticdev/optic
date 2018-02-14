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
        |			"file": "/Users/aidancunniffe/Developer/knack/optic-core/test-examples/resources/tmp/test_project/app.js",
        |			"position": 93,
        |			"type": "as-child-of"
        |		},
        |   "gearId": "7b00f2ec",
        |		"type": "insert-model"
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
        |		"gearId": "7b00f2ec",
        |		"atLocation": {
        |			"file": "/Users/aidancunniffe/Developer/knack/optic-core/test-examples/resources/tmp/test_project/app.js",
        |			"position": 38,
        |			"type": "as-child-of"
        |		},
        |		"type": "insert-model"
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

}
