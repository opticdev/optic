package com.opticdev.core.sourcegear.sync

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.SGConstructor
import com.opticdev.core.sourcegear.graph.ProjectGraphWrapper
import com.opticdev.core.sourcegear.graph.edges.DerivedFrom
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, MultiModelNode}
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.core.sourcegear.snapshot.Snapshot
import com.opticdev.opm
import com.opticdev.opm.TestPackageProviders
import com.opticdev.common.SchemaRef
import play.api.libs.json.{JsObject, JsString, Json}

import scala.concurrent.Await
import scala.concurrent.duration._
class DiffSyncGraphSpec extends AkkaTestFixture("DiffSyncGraphSpec") with SyncFixture with GearUtils with TestPackageProviders {

  def checkReplace(diff: SyncDiff, before: String, after: String) = {
    val asReplace = diff.asInstanceOf[Replace]
    assert(asReplace.before == Json.parse(before))
    assert(asReplace.after == Json.parse(after))
  }

  it("can calculate a valid diff for direct dependencies (1 edge)") {

    val f = fixture("test-examples/resources/example_source/sync/Sync.js")
    implicit val project = f.project

    val diff = DiffSyncGraph.calculateDiff(f.snapshot)
    assert(!diff.containsErrors)
    assert(diff.changes.size == 2)
    checkReplace(diff.changes(0), """{"value":"world"}""", """{"value":"hello"}""")
    checkReplace(diff.changes(1), """{"value":"vietnam"}""", """{"value":"good morning"}""")
  }

  it("can calculate a valid diff when no changes") {

    val f = fixture("test-examples/resources/example_source/sync/NoSyncNeeded.js")
    implicit val project = f.project

    val diff = DiffSyncGraph.calculateDiff(f.snapshot)(project, true)
    assert(!diff.containsErrors)
    assert(diff.changes.size == 1)
    assert(diff.changes(0).isInstanceOf[NoChange])
  }

  it("can calculate a valid diff for dependency tree") {
    val f = fixture("test-examples/resources/example_source/sync/TreeSync.js")
    implicit val project = f.project

    val diff = DiffSyncGraph.calculateDiff(f.snapshot)
    assert(!diff.containsErrors)
    assert(diff.changes.size == 3)
    checkReplace(diff.changes(0), """{"value":"b"}""", """{"value":"a"}""")
    checkReplace(diff.changes(1), """{"value":"c"}""", """{"value":"a"}""")
    checkReplace(diff.changes(2), """{"value":"d"}""", """{"value":"a"}""")
  }

  it("can calculate a valid diff for branched dependency tree") {
    val f = fixture("test-examples/resources/example_source/sync/BranchedTreeSync.js")
    implicit val project = f.project

    val diff = DiffSyncGraph.calculateDiff(f.snapshot)
    assert(!diff.containsErrors)
    assert(diff.changes.size == 4)
    checkReplace(diff.changes(0), """{"value":"0"}""", """{"value":"a"}""")
    checkReplace(diff.changes(1), """{"value":"b"}""", """{"value":"a"}""")
    checkReplace(diff.changes(2), """{"value":"b"}""", """{"value":"a"}""")
    checkReplace(diff.changes(3), """{"value":"b"}""", """{"value":"a"}""")
  }

  it("can do a diff across multiple files") {
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), syncTestSourceGear)
    val pgw = ProjectGraphWrapper.empty()
    val resultsA = {
      val file = File("test-examples/resources/example_source/sync/multi_file/A.js")
      val astResults = syncTestSourceGear.parseFile(file).get
      pgw.addFile(astResults.astGraph, file, astResults.fileTokenRegistry.exports)
    }

    val resultsB = {
      val file = File("test-examples/resources/example_source/sync/multi_file/B.js")
      val astResults = syncTestSourceGear.parseFile(file).get
      pgw.addFile(astResults.astGraph, file, astResults.fileTokenRegistry.exports)
    }

    project.stageProjectGraph(pgw.projectGraph)

    val snapshot = Await.result(Snapshot.forSourceGearAndProjectGraph(syncTestSourceGear, project.projectGraphWrapper.projectGraph, project.actorCluster.parserSupervisorRef, project), 30 seconds)

    val diff = DiffSyncGraph.calculateDiff(snapshot)
    assert(diff.changes.size == 2)
    checkReplace(diff.changes(0), """{"value":"vietnam"}""", """{"value":"good morning"}""")
    checkReplace(diff.changes(1), """{"value":"world"}""", """{"value":"hello"}""")
  }

  it("will diff based on tags") {
    val sourceGear = fromDependenciesList("optic:express-js@0.1.0", "optic:rest@0.1.0", "optic:mongoose@0.1.0")
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)
    val pgw = ProjectGraphWrapper.empty()
    val file = File("test-examples/resources/example_source/sync/Tagged.js")
    val astResults = sourceGear.parseFile(file).get
    pgw.addFile(astResults.astGraph, file, astResults.fileTokenRegistry.exports)

    project.stageProjectGraph(pgw.projectGraph)

    val snapshot = Await.result(Snapshot.forSourceGearAndProjectGraph(sourceGear, pgw.projectGraph, project.actorCluster.parserSupervisorRef, project), 30 seconds)

    val diff = DiffSyncGraph.calculateDiff(snapshot)

    assert(diff.noErrors)
    assert(diff.filePatches.size == 1)
    assert(diff.filePatches.head.newFileContents === """const user = mongoose.model('peoples', new mongoose.Schema({ //name: User Model
                                                       |    'firstName': 'string',
                                                       |    'lastName': 'string',
                                                       |    'isAdmin': 'boolean',
                                                       |    'newField': 'string',
                                                       |}))
                                                       |
                                                       |app.post('/peoples', function (req, res) { //source: User Model -> optic:mongoose@0.1.0/createroutefromschema {"queryProvider": "optic:mongoose/insert-record"}
                                                       |
                                                       |  otherCode.weWantToKeep()
                                                       |
                                                       |  new Model({ firstName: req.body.firstName, //tag: query
                                                       |  lastName: req.body.lastName,
                                                       |  isAdmin: req.body.isAdmin,
                                                       |  newField: req.body.newField }).save((err, item) => {
                                                       |    if (!err) {
                                                       |        res.send(200, item)
                                                       |    } else {
                                                       |        res.send(400, err)
                                                       |    }
                                                       |  })
                                                       |})""".stripMargin)

  }

  it("can diff a multinode model") {
    val f = multiNodeSyncFixture("test-examples/resources/example_source/sync/MultiNodeSync.js")
    implicit val project = f.project

    val diff = DiffSyncGraph.calculateDiff(f.snapshot)

    val multiModelNodes = f.results.astGraph.nodes.collect {
      case x if x.value.isInstanceOf[MultiModelNode] => x.value.asInstanceOf[MultiModelNode].expandedValue()
    }

    assert(diff.noErrors)
    assert(diff.filePatches.size == 1)
    assert(diff.filePatches.head.newFileContents === """function greeting() { //name: TestMulti
                                                       | return "Whats UP"
                                                       |}
                                                       |
                                                       |function helloWorld() {
                                                       | if (true) {
                                                       |
                                                       | }
                                                       | return greeting()+' '+'FRIENDO'
                                                       |}
                                                       |
                                                       |
                                                       |
                                                       |function greeting() { //source: TestMulti -> optic:synctest/passthrough-transform
                                                       | return "Whats UP"
                                                       |}
                                                       |
                                                       |function helloWorld() {
                                                       | if (true) {
                                                       |
                                                       | }
                                                       | return greeting()+' '+'FRIENDO'
                                                       |}
                                                       |
                                                       |""".stripMargin)

  }

  describe("error handling") {

    it("will handle errors gracefully") {
      val f = fixture("test-examples/resources/example_source/sync/InvalidSync.js")
      implicit val project = f.project

      val diff = DiffSyncGraph.calculateDiff(f.snapshot)
      assert(diff.containsErrors)
      assert(diff.changes(0).isInstanceOf[ErrorEvaluating])
      checkReplace(diff.changes(1), """{"value":"world"}""", """{"value":"hello"}""")
    }

    it("will handle errors for a tree gracefully") {
      val f = fixture("test-examples/resources/example_source/sync/InvalidTreeSync.js")
      implicit val project = f.project

      val diff = DiffSyncGraph.calculateDiff(f.snapshot)
      assert(diff.containsErrors)
      checkReplace(diff.changes(0), """{"value":"b"}""", """{"value":"a"}""")
      assert(diff.changes(1).isInstanceOf[ErrorEvaluating])  //gets skipped, then sync continues at the next leaf
      checkReplace(diff.changes(2), """{"value":"d"}""", """{"value":"c"}""")
      checkReplace(diff.changes(3), """{"value":"e"}""", """{"value":"c"}""")
    }

  }

  it("can calculate a valid diff for connected project dependencies (1 edge)") {

    val f = fixture("test-examples/resources/example_source/sync/ConnectedProjectSync.js")
    implicit val project = f.project

    val diff = DiffSyncGraph.calculateDiff(f.snapshot)
    assert(!diff.containsErrors)
    assert(diff.changes.size == 1)
    checkReplace(diff.changes(0), """{"value":"hello"}""", """{"value":"fromForeignProject"}""")
  }


  describe("Trigger events are saved with changes") {

    it("a single change that propagates across a tree will be the trigger for everything") {
      val f = fixture("test-examples/resources/example_source/sync/BranchedTreeSync.js")
      implicit val project = f.project

      val diff = DiffSyncGraph.calculateDiff(f.snapshot)

      val allTriggers = diff.changes.map(_.asInstanceOf[Replace].trigger.get).distinct
      assert(allTriggers.size == 1)
      assert(allTriggers.head == Trigger("a", SchemaRef(Some(PackageRef("optic:synctest", "0.1.0")), "source-schema"), JsObject(Seq("value" -> JsString("a")))))

    }

    it("two single changes will have their own triggers") {
      val f = fixture("test-examples/resources/example_source/sync/Sync.js")
      implicit val project = f.project

      val diff = DiffSyncGraph.calculateDiff(f.snapshot)

      val allTriggers = diff.changes.map(_.asInstanceOf[Replace].trigger.get).distinct
      assert(allTriggers.size == 2)
      assert(allTriggers ==
        Vector(
          Trigger("Hello Model", SchemaRef(Some(PackageRef("optic:synctest", "0.1.0")), "source-schema"), JsObject(Seq("value" -> JsString("hello")))),
          Trigger("Good Morning", SchemaRef(Some(PackageRef("optic:synctest", "0.1.0")), "source-schema"), JsObject(Seq("value" -> JsString("good morning"))))
        ))
    }

    it("partiality evaluated trees get multiple triggers") {
      val f = fixture("test-examples/resources/example_source/sync/InvalidTreeSync.js")
      implicit val project = f.project
      val diff = DiffSyncGraph.calculateDiff(f.snapshot)
      val allTriggers = diff.changes.filter(_.newValue.isDefined).map(_.asInstanceOf[Replace].trigger.get).distinct
      assert(allTriggers.size == 2)
    }

  }

  it("to Json") {
    val f = fixture("test-examples/resources/example_source/sync/TreeSync.js")
    implicit val project = f.project

    val diff = DiffSyncGraph.calculateDiff(f.snapshot)
    assert(diff.asJson("atom") == Json.parse("""{"projectName":"test","editorSlug":"atom","warnings":[],"errors":[],"changes":[{"file":"/Users/aidancunniffe/Developer/knack/optic-core/test-examples/resources/example_source/sync/TreeSync.js","originalFileContents":"source('a') //name: a\nsource('b') //name: b, source: a -> optic:synctest/passthrough-transform\nsource('c') //name: c, source: b -> optic:synctest/passthrough-transform\ntarget('d') //name: d, source: c -> optic:synctest/passthrough-transform","newFileContents":"source('a') //name: a\nsource('a') //name: b, source: a -> optic:synctest/passthrough-transform\nsource('a') //name: c, source: b -> optic:synctest/passthrough-transform\ntarget('a') //name: d, source: c -> optic:synctest/passthrough-transform","relativePath":"/resources/example_source/sync/TreeSync.js"}],"triggers":[{"name":"a","schemaRef":"optic:synctest@0.1.0/source-schema","newValue":{"value":"a"},"changes":["3 instances of optic:synctest/source-schema"]}]}"""))
  }

}
