package com.opticdev.server.state

import better.files.File
import com.opticdev.core.Fixture.{AkkaTestFixture, TestBase}
import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import com.opticdev.core.sourcegear.project.{OpticProject, StaticSGProject}
import com.opticdev.sdk.descriptions.SchemaRef
import org.scalatest.FunSpec
import play.api.libs.json.JsObject

class NodeKeyStoreSpec extends TestBase {

  implicit val project : OpticProject = null

  it("can lease an id and look it up") {
    val nodeKeyStore = new NodeKeyStore
    val testFile = File("hello/world")
    val id = nodeKeyStore.leaseId(testFile, LinkedModelNode(null, null, null, null, null, null))
    assert(id.nonEmpty)
    assert(nodeKeyStore.lookupId(id).isDefined)
    assert(nodeKeyStore.lookupIdInFile(id, testFile).isDefined)
  }

  it("can invalidate a file's ids") {
    val nodeKeyStore = new NodeKeyStore
    val testFile = File("hello/world")
    val id = nodeKeyStore.leaseId(testFile, LinkedModelNode(null, null, null, null, null, null))

    nodeKeyStore.invalidateFileIds(testFile)
    assert(nodeKeyStore.lookupId(id).isEmpty)
  }

}
