package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.opm.{PackageManager, TestPackageProviders, TestProvider}
import org.scalatest.FunSpec

class SGConstructorSpec extends FunSpec with TestPackageProviders {

  describe("SGConstructor") {

    val projectFile = new ProjectFile(File("test-examples/resources/example_packages/express/optic.yaml"))

    it("can resolve all dependencies in a project file") {

      SGConstructor.fromProjectFile(projectFile)

    }

  }

}
