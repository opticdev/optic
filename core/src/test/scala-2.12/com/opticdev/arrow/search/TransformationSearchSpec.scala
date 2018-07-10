package com.opticdev.arrow.search

import akka.actor.ActorSystem
import better.files.File
import com.opticdev.arrow.context.{ModelContext, NoContext}
import com.opticdev.arrow.graph.KnowledgeGraphImplicits.DirectTransformation
import com.opticdev.arrow.state.NodeKeyStore
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.opm.TestPackageProviders
import org.scalatest.FunSpec
import play.api.libs.json.JsObject
import com.opticdev.core.sourcegear.actors.ActorCluster

class TransformationSearchSpec extends TestBase {
  implicit val nodeKeyStore = new NodeKeyStore

  implicit val editorSlug: String = "test"

  implicit lazy val project = new StaticSGProject("test", File("test-examples/resources/tmp/test_project"), null)(new ActorCluster(ActorSystem("test")))

  it("finds transformations when valid context is present") {
    import com.opticdev.arrow.ExampleSourcegears.sgWithTransformations._

    val context = ModelContext(null, null, Vector(ModelNode(schemaModel.schemaRef, JsObject.empty, null, Map(), None, None, None, "a")))

    val results = TransformationSearch.search(context)(sourceGear, project, knowledgeGraph, editorSlug, nodeKeyStore)

    assert(results.size == 1)
    assert(results.head.transformationChange.asInstanceOf[DirectTransformation].transformation.yields == "Model -> Route")

  }

  it("finds transformations based on search query") {
    import com.opticdev.arrow.ExampleSourcegears.sgWithTransformations._

    val context = NoContext

    val results = TransformationSearch.search("Route", context)(sourceGear, project, knowledgeGraph, editorSlug, nodeKeyStore)

    assert(results.size == 3)
    assert(results.head.transformationChange.asInstanceOf[DirectTransformation].transformation.yields == "Model -> Route")

  }

  it("can convert transformation result to JSON ") {
    import com.opticdev.arrow.ExampleSourcegears.sgWithTransformations._

    val context = ModelContext(File("/test/file"), Range(32, 42), Vector(ModelNode(schemaModel.schemaRef, JsObject.empty, null, Map(), None, None, None, "a")))

    val results = TransformationSearch.search(context)(sourceGear, project, knowledgeGraph, editorSlug, nodeKeyStore)
    
    assert(results.head.asJson.toString() == """{"name":"Model -> Route","projectName":"test","editorSlug":"test","packageId":"optic:test-transform@latest","input":"optic:test@0.1.0/model","output":"optic:test@0.1.0/route","changes":[{"transformationChanges":{"transformation":{"yields":"Model -> Route","id":"m2r","packageId":"optic:test-transform@latest","input":"optic:test@0.1.0/model","output":"optic:test@0.1.0/route","ask":{"type":"object"},"dynamicAsk":{"type":"object"},"script":""},"target":"optic:test@0.1.0/route","_type":"com.opticdev.arrow.graph.KnowledgeGraphImplicits.DirectTransformation"},"inputValue":{},"askSchema":{"type":"object","properties":{}},"lensOptions":[],"locationOptions":[{"file":"/test/file","position":43,"_type":"com.opticdev.arrow.changes.location.AsChildOf"}],"_type":"com.opticdev.arrow.changes.RunTransformation"},{"file":"/test/file","prefixPattern":"^\\s*\\/\\/\\/.*","_type":"com.opticdev.arrow.changes.ClearSearchLines"}]}""")

  }

}
