package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.arrow.state.NodeKeyStore
import com.opticdev.common.PackageRef
import com.opticdev.core.Fixture.{AkkaTestFixture, TestBase}
import com.opticdev.core.Fixture.compilerUtils.{GearUtils, ParserUtils}
import com.opticdev.core.sourcegear.actors.ParseSupervisorSyncAccess
import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.marvin.runtime.mutators.NodeMutatorMap
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.sdk.descriptions.transformation.generate.StagedNode
import com.opticdev.sdk.descriptions.transformation.mutate.{MutationOptions, StagedContainerMutation, StagedMutation, StagedTagMutation}
import org.scalatest.PrivateMethodTester
import play.api.libs.json.{JsArray, JsObject, JsString}
import com.opticdev.sdk.descriptions.transformation.mutate.ContainerMutationOperationsEnum._

class MutateSpec extends AkkaTestFixture("MutateSpec") with PrivateMethodTester with GearUtils with ParserUtils {

  def fixture = new {
    val file = File("test-examples/resources/example_source/ExampleExpressForMutate.js")
    implicit val fileContents = file.contentAsString
    val sourceGear = sourceGearFromDescription("test-examples/resources/example_packages/optic:FlatExpress_non_distinct_params@0.1.0.json")
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/example_source/"), sourceGear)
    val result = sourceGear.parseFile(file)
    project.projectGraphWrapper.addFile(result.get.astGraph, file)

    implicit val sourceGearContext = ParseSupervisorSyncAccess.getContext(file)(project.actorCluster, sourceGear, project).get
    val route = result.get.modelNodes.find(_.lensRef.id == "route").get.resolved()
    val routeValue = route.expandedValue(false)(sourceGearContext)
  }

  describe("resolving model node") {
    it("works when valid") {
      val f = fixture
      implicit val nodeKeyStore = new NodeKeyStore
      val modelId = nodeKeyStore.leaseId(f.file, f.route)
      assert(Mutate.resolveNode(modelId).contains(f.route))
    }

    it("fails when no id present") {
      implicit val nodeKeyStore = new NodeKeyStore
      assert(Mutate.resolveNode("not_real").isEmpty)
    }
  }

  it("can make a simple update") {
    val f = fixture
    implicit val nodeKeyStore = new NodeKeyStore
    implicit val project = f.project
    implicit val sourceGearContext = f.sourceGearContext

    val modelId = nodeKeyStore.leaseId(f.file, f.route)

    val results = Mutate.fromStagedMutation(StagedMutation(modelId, Some(
      JsObject(Seq("url" -> JsString("changed")))
    )))

    assert(results.isSuccess)
    assert(results.get._2 == "app.get('changed', function (req, res) {\n    req.query.firstLevel\n    if (true) {\n        req.body.nested\n        req.body.nested\n        req.header.bob\n        app.get('suburl', function (req, res) { //tag: sub\n\n        })\n        app.get('suburl2', function (req, res) { //tag: subTwo\n\n        })\n    }\n})")

  }

  describe("tag mutations") {

    val expected = """app.get('changed', function (req, res) { //tag: sub
                     |
                     |        })""".stripMargin

    it("work directly with valid tag") {
      val f = fixture
      implicit val nodeKeyStore = new NodeKeyStore
      implicit val project = f.project
      implicit val sourceGearContext = f.sourceGearContext
      val modelId = nodeKeyStore.leaseId(f.file, f.route)

      val mutateTagResults = Mutate.mutateTag(f.route.root, "sub", StagedTagMutation(Some(
        JsObject(Seq("url" -> JsString("changed")))
      )))

      assert(mutateTagResults.isSuccess)
      assert(mutateTagResults.get._2 == expected)

    }

    it("work when its a sub mutation") {
      val f = fixture
      implicit val nodeKeyStore = new NodeKeyStore
      implicit val project = f.project
      implicit val sourceGearContext = f.sourceGearContext
      val modelId = nodeKeyStore.leaseId(f.file, f.route)

      val stagedMutation = StagedMutation(modelId, None, Some(MutationOptions(
        tags = Some(Map("sub" -> StagedTagMutation(Some(
          JsObject(Seq("url" -> JsString("changed")))
        )))))
      ))

      assert(Mutate.fromStagedMutation(stagedMutation).get._2 == "app.get('url', function (req, res) {\n    req.query.firstLevel\n    if (true) {\n        req.body.nested\n        req.body.nested\n        req.header.bob\n        app.get('changed', function (req, res) { //tag: sub\n\n        })\n        app.get('suburl2', function (req, res) { //tag: subTwo\n\n        })\n    }\n})")
    }

    it("work when multiple multiple tags are mutated & value updated") {
      val f = fixture
      implicit val nodeKeyStore = new NodeKeyStore
      implicit val project = f.project
      implicit val sourceGearContext = f.sourceGearContext
      val modelId = nodeKeyStore.leaseId(f.file, f.route)

      val stagedMutation = StagedMutation(modelId, Some(JsObject(Seq("method" -> JsString("head")))), Some(MutationOptions(
        tags = Some(
          Map(
            "sub" -> StagedTagMutation(Some(
              JsObject(Seq("url" -> JsString("first")))
            )),
            "subTwo" -> StagedTagMutation(Some(
              JsObject(Seq("url" -> JsString("second")))
            ))
          )))
      ))

      assert(Mutate.fromStagedMutation(stagedMutation).get._2 == "app.head('url', function (req, res) {\n    req.query.firstLevel\n    if (true) {\n        req.body.nested\n        req.body.nested\n        req.header.bob\n        app.get('first', function (req, res) { //tag: sub\n\n        })\n        app.get('second', function (req, res) { //tag: subTwo\n\n        })\n    }\n})")
    }

  }


  describe("container mutations") {

    it("works directly emptying a valid container") {
      val f = fixture
      implicit val nodeKeyStore = new NodeKeyStore
      implicit val project = f.project
      implicit val sourceGearContext = f.sourceGearContext

      val modelId = nodeKeyStore.leaseId(f.file, f.route)

      val results = Mutate.mutateContainer(f.route, "callback", StagedContainerMutation(Empty))

      assert(results.get._2 == "{\n    \n}")
    }

    it("does nothing when container not found") {
      val f = fixture
      implicit val nodeKeyStore = new NodeKeyStore
      implicit val project = f.project
      implicit val sourceGearContext = f.sourceGearContext

      val modelId = nodeKeyStore.leaseId(f.file, f.route)

      val results = Mutate.mutateContainer(f.route, "notReal", StagedContainerMutation(Empty))

      assert(results.isEmpty)
    }

    it("works directly adding a staged node to a valid container") {
      val f = fixture
      implicit val nodeKeyStore = new NodeKeyStore
      implicit val project = f.project
      implicit val sourceGearContext = f.sourceGearContext

      val modelId = nodeKeyStore.leaseId(f.file, f.route)

      val results = Mutate.mutateContainer(f.route, "callback", StagedContainerMutation(Append(Seq(
        StagedNode(SchemaRef(Some(PackageRef("optic:flatexpress",  "0.1.0")), "parameter"), JsObject(Seq(
          "in" -> JsString("query"),
          "name" -> JsString("justAdded")
        ))))
      )))

      assert(results.get._2 == "{\n    req.query.firstLevel\n    if (true) {\n        req.body.nested\n        req.body.nested\n        req.header.bob\n        app.get('suburl', function (req, res) { //tag: sub\n\n        })\n        app.get('suburl2', function (req, res) { //tag: subTwo\n\n        })\n    }\n    req.query.justAdded\n}")
    }

    it("work when its a sub mutation") {
      val f = fixture
      implicit val nodeKeyStore = new NodeKeyStore
      implicit val project = f.project
      implicit val sourceGearContext = f.sourceGearContext
      val modelId = nodeKeyStore.leaseId(f.file, f.route)

      val stagedMutation = StagedMutation(modelId, None, Some(MutationOptions(
        containers = Some(Map(
          "callback" -> StagedContainerMutation(Empty)
        ))
      )))

      assert(Mutate.fromStagedMutation(stagedMutation).get._2 == "app.get('url', function (req, res) {\n    \n})")

    }

    it("work when combined with a tag & value update") {
      val f = fixture
      implicit val nodeKeyStore = new NodeKeyStore
      implicit val project = f.project
      implicit val sourceGearContext = f.sourceGearContext
      val modelId = nodeKeyStore.leaseId(f.file, f.route)

      val stagedMutation = StagedMutation(modelId, Some(JsObject(Seq("method" -> JsString("head")))), Some(MutationOptions(
        tags = Some(
          Map(
            "sub" -> StagedTagMutation(Some(
              JsObject(Seq("url" -> JsString("first")))
            ))
          )
        ),
        containers = Some(Map(
          "callback" -> StagedContainerMutation(Append(Seq(
            StagedNode(SchemaRef(Some(PackageRef("optic:flatexpress",  "0.1.0")), "parameter"), JsObject(Seq(
              "in" -> JsString("query"),
              "name" -> JsString("justAdded")
            ))))
          ))
        ))
      )))

      println(Mutate.fromStagedMutation(stagedMutation).get._2)

      assert(Mutate.fromStagedMutation(stagedMutation).get._2 == "app.head('url', function (req, res) {\n    req.query.firstLevel\n    if (true) {\n        req.body.nested\n        req.body.nested\n        req.header.bob\n        app.get('first', function (req, res) { //tag: sub\n\n        })\n        app.get('suburl2', function (req, res) { //tag: subTwo\n\n        })\n    }\n    req.query.justAdded\n})")

    }

  }

}
