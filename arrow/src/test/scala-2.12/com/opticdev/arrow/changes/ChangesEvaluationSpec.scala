package com.opticdev.arrow.changes

import com.opticdev.core.Fixture.TestBase
import com.opticdev.opm.TestPackageProviders
import play.api.libs.json.Json
import ExampleChanges._
import better.files.File
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.core.sourcegear.{SGConfig, SGConstructor}
import scala.concurrent.duration._
import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global

class ChangesEvaluationSpec extends TestBase with TestPackageProviders {

  describe("Insert Model") {

    val expectedChange = "let first = require('second')\n\napp.get('user/:id', function (req, res) {\n    req.query.id\n})\n\napp.get('post/:id', function (req, res) {\n    req.query.id\n})\n\napp.post('path/to/resource', function (req, res) {\n\n})"

    it("can evaluate insert model operations") {
      val (changeGroup, sourcegear) = simpleModelInsert
      val results = changeGroup.evaluate(sourcegear)

      assert(results.isSuccess)
      assert(results.stagedFiles.head._2.text === expectedChange)
    }

    it("can write changes to disk") {
      val (changeGroup, sourcegear) = simpleModelInsert
      val results = changeGroup.evaluateAndWrite(sourcegear)
      File("test-examples/resources/test_project/app.js").contentAsString == expectedChange
    }

  }

}
