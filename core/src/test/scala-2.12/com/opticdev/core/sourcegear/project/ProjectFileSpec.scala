package com.opticdev.core.sourcegear.project

import java.nio.file.NoSuchFileException

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.InvalidProjectFileException
import com.opticdev.core.sourcegear.project.config.ProjectFile
import net.jcazevedo.moultingyaml.YamlString

class ProjectFileSpec extends TestBase {

  describe("instantiates from a YAML file") {
    it("should work when valid") {
      val pf = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/project.yml"))
      assert(pf.interface.isSuccess)
    }
    it("should not have interface if the file does not exist") {
      val pf = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/notReal.yml"))
      assert(pf.interface.isFailure)
    }
    it("should not have interface if file is invalid YAML") {
      val pf = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/invalidFile.yml"))
      assert(pf.interface.isFailure)
    }
  }


  def fixture = new {
    lazy val invalidConnectedFile = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/invalidConnectedFile.yml"))
    lazy val connectedFile = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/connectedFile.yml"))
    lazy val defined6 = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/project6.yml"))
    lazy val defined5 = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/project5.yml"))
    lazy val defined4 = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/project4.yml"))
    lazy val defined3 = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/project3.yml"))
    lazy val defined2 = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/project2.yml"))
    lazy val defined = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/project.yml"))
    lazy val empty = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/empty.yml"))
  }


  describe("fields") {

    it("includes name") {
      val f = fixture
      println(f.defined.interface.errors)
      assert(f.defined.name.get == "Test project")
    }

    it("includes parsers") {
      val f = fixture
      assert(f.defined.parsers.size == 1)
      assert(f.empty.parsers.isEmpty)
    }

    it("includes connected projects") {
      val f = fixture
      assert(f.defined.connected_projects.size == 2)
      assert(f.empty.connected_projects.isEmpty)
    }

    it("includes skills") {
      val f = fixture
      assert(f.defined.dependencies.get.size == 1)
    }

    it("includes excluded files") {
      val f = fixture
      assert(f.defined.interface.primary.exclude.get.size == 1)
    }
  }

  describe("dependencies") {
    resetScratch
    val f = fixture
    it("can be extracted") {
      val dependencies = f.defined2.dependencies
      assert(dependencies.get.toSet ==
        Set(
          PackageRef("optic:express-js", "0.1.0"),
          PackageRef("optic:react-js", "1.0.0"),
          PackageRef("optic:rest", "latest")))
    }

    it("will fail if contains duplicates") {
      val dependencies = f.defined3.dependencies
      assert(dependencies.failed.get.getLocalizedMessage == "requirement failed: Duplicate packages not allowed: optic:rest")
    }

    it("will fail if any packages are not valid ") {
      val dependencies = f.defined4.dependencies
      assert(dependencies.failed.get.getLocalizedMessage == "requirement failed: 'skills' requirement failed: Invalid Skill package reference 'optic:react-js@@@1.0.0'")
    }

  }

  describe("hashing") {
    it("can hash a project file/disk state") {
      val f = fixture
      assert(f.defined.hash == f.defined.hash)
    }
  }

  describe("connected files") {

    it("can find other file refs") {
      val f = fixture
      assert(f.connectedFile.interface.secondary.size == 1)
      assert(f.connectedFile.interface.secondary.head.objects.get.size == 1)
    }

    it("will fail if referenced file does not exist") {
      val f = fixture
      assert(f.invalidConnectedFile.interface.errors.head == "Failed to load secondary project file: /Users/aidancunniffe/Developer/knack/optic-core/test-examples/resources/tmp/example_project_files/booooo.yml")
    }


  }

}
