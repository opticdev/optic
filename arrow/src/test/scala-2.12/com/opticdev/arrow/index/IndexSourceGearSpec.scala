package com.opticdev.arrow.index

import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.SGConstructor
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.opm.TestPackageProviders

import scala.concurrent.duration._
import scala.concurrent.Await

class IndexSourceGearSpec extends TestBase with TestPackageProviders {

  lazy val sourcegear = {
    val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/example_packages/express/optic.yaml")))
    Await.result(future, 10 seconds)
  }.inflate

  it("can index a sourcegear instance for arrow") {
    val knowledgeGraph = IndexSourceGear.runFor(sourcegear)
    null
  }


}
