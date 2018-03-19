package com.opticdev.arrow.search

import akka.actor.ActorSystem
import better.files.File
import com.opticdev.arrow.context.ModelContext
import com.opticdev.arrow.graph.KnowledgeGraphImplicits.DirectTransformation
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.opm.TestPackageProviders
import org.scalatest.FunSpec
import play.api.libs.json.JsObject
import com.opticdev.core.sourcegear.actors.ActorCluster

class TransformationSearchSpec extends TestBase {

  implicit val project = new StaticSGProject("test", File("test-examples/resources/tmp/test_project"), null)(false, new ActorCluster(ActorSystem("test")))

  it("finds transformations when valid context is present") {
    import com.opticdev.arrow.ExampleSourcegears.sgWithTransformations._

    val context = ModelContext(null, null, Vector(ModelNode(schemaModel.schemaRef, JsObject.empty, 0)))

    val results = TransformationSearch.search(context)(sourceGear, project, knowledgeGraph)

    assert(results.size == 1)
    assert(results.head.transformationChange.asInstanceOf[DirectTransformation].transformation.name == "Model -> Route")

  }

  it("can convert transformation result to JSON ") {
    import com.opticdev.arrow.ExampleSourcegears.sgWithTransformations._

    val context = ModelContext(File("/test/file"), Range(32, 42), Vector(ModelNode(schemaModel.schemaRef, JsObject.empty, 0)))

    val results = TransformationSearch.search(context)(sourceGear, project, knowledgeGraph)

    assert(results.head.asJson.toString() == """{"name":"Model -> Route","projectName":"test","packageId":"optic:test-transform@latest","input":"optic:test@latest/model","output":"optic:test@latest/route","changes":[{"transformationChanges":{"transformation":{"name":"Model -> Route","packageId":"optic:test-transform@latest","input":"optic:test@latest/model","output":"optic:test@latest/route","ask":{"type":"object"},"script":""},"target":"optic:test@latest/route","_type":"com.opticdev.arrow.graph.KnowledgeGraphImplicits.DirectTransformation"},"inputValue":{},"gearOptions":[],"locationOptions":[{"file":"/test/file","position":43,"_type":"com.opticdev.arrow.changes.location.AsChildOf"}],"_type":"com.opticdev.arrow.changes.RunTransformation"}]}""")

  }

}
