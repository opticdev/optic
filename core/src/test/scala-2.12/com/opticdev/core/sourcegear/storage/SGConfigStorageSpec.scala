package com.opticdev.core.sourcegear.storage

import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.SGConstructor
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.opm.{TestPackageProviders, TestProvider}
import scala.concurrent.duration._
import scala.concurrent.Await

class SGConfigStorageSpec extends TestBase with TestPackageProviders {

  lazy val projectFile = new ProjectFile(File("test-examples/resources/example_packages/express/optic.yml"))
  lazy val sgConfig = {
    val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/example_packages/express/optic.yml")))
    Await.result(future, 5 seconds)
  }

  it("can be saved to disk") {
    SGConfigStorage.writeToStorage(sgConfig, projectFile.hash)
  }

  describe("can be loaded from disk") {

    it("by hash") {
      assert(SGConfigStorage.loadFromStorage(projectFile.hash).get == sgConfig)
    }

  }

}
