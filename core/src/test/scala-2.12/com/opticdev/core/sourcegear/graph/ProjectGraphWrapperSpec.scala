package com.opticdev.core.sourcegear.graph
import com.opticdev.core.actorSystem
import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.core.sourcegear.project.{Project, StaticSGProject}
import com.opticdev.sdk.descriptions.SchemaRef

class ProjectGraphWrapperSpec extends AkkaTestFixture("ProjectGraphWrapperTest") with GearUtils {

  it("can be initialized empty") {
    assert(ProjectGraphWrapper.empty.projectGraph.isEmpty)
  }

  implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)

  val testFilePath = getCurrentDirectory + "/test-examples/resources/example_source/ImportSource.js"
  val file = File(testFilePath)
  val importResults = {
    val importGear = gearFromDescription("test-examples/resources/example_packages/optic:ImportExample@0.1.0.json")
    sourceGear.gearSet.addGear(importGear)
    sourceGear.parseFile(File(testFilePath))
  }

  it("can add models from AstGraph") {
    val projectGraphWrapper = ProjectGraphWrapper.empty

    projectGraphWrapper.addFile(importResults.get.astGraph, file)

    assert(projectGraphWrapper.projectGraph.nodes.size == 3)
    assert(projectGraphWrapper.projectGraph.edges.size == 2)
  }

  it("can apply queries to the project graph") {
    val projectGraphWrapper = ProjectGraphWrapper.empty
    projectGraphWrapper.addFile(importResults.get.astGraph, file)
    val results = projectGraphWrapper.query((node)=> {
      node.value match {
        case mn: BaseModelNode => mn.schemaId == SchemaRef.fromString("optic:ImportExample@0.1.0/js-import").get
        case _ => false
      }
    })

    assert(results.size == 2)
  }

  it("gets the subgraph for a file") {
    val projectGraphWrapper = ProjectGraphWrapper.empty
    projectGraphWrapper.addFile(importResults.get.astGraph, file)

    assert( projectGraphWrapper.subgraphForFile(file).get == projectGraphWrapper.projectGraph)
  }

  it("can remove file from AstGraph ") {

    val projectGraphWrapper = ProjectGraphWrapper.empty
    projectGraphWrapper.addFile(importResults.get.astGraph, file)

    projectGraphWrapper.removeFile(file)

    assert(projectGraphWrapper.projectGraph.isEmpty)

  }
}
