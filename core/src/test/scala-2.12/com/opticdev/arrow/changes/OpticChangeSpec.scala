package com.opticdev.arrow.changes

import better.files.File
import com.opticdev.arrow.changes.evaluation.Evaluation
import com.opticdev.arrow.state.NodeKeyStore
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor

class OpticChangeSpec extends TestBase {
  implicit val nodeKeyStore = new NodeKeyStore

  it("Clear search change works") {

    val expected = "class code {\n\n}\n\nfunction code1(arg1, arg2) {\n\n}\n"
    val result = Evaluation.forChange(ClearSearchLines(File("test-examples/resources/example_source/ClearSearchTest.js")), null, null)(new FileStateMonitor(), nodeKeyStore)
    assert(result.isSuccess)
    assert(result.asFileChanged.newContents == expected)

  }


}
