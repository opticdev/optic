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
      val pf = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/project.yaml"))
      assert(pf.interface.isSuccess)
    }
    it("should not have interface if the file does not exist") {
      val pf = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/notReal.yaml"), false)
      assert(pf.interface.failed.get == InvalidProjectFileException("Project file not found"))
    }
    it("should not have interface if file is invalid YAML") {
      val pf = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/invalidFile.yaml"), false)
      assert(pf.interface.failed.get == InvalidProjectFileException("syntax error in YAML"))
    }

  }


  def fixture = new {
    val defined6 = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/project6.yaml"))
    val defined5 = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/project5.yaml"))
    val defined4 = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/project4.yaml"))
    val defined3 = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/project3.yaml"))
    val defined2 = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/project2.yaml"))
    val defined = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/project.yaml"))
    val empty = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/empty.yaml"))
  }


  describe("fields") {

    it("includes name") {
      val f = fixture
      assert(f.defined.interface.get.name.yamlValue == YamlString("Test project"))
      assert(f.empty.interface.get.name.yamlValue == YamlString("Unnamed Project"))
    }

    it("includes parsers") {
      val f = fixture
      assert(f.defined.interface.get.parsers.value.size == 1)
      assert(f.empty.interface.get.parsers.value.isEmpty)
    }

    it("includes knowledge") {
      val f = fixture
      assert(f.defined.interface.get.knowledge.value.size == 1)
      assert(f.empty.interface.get.knowledge.value.isEmpty)
    }

    it("includes knowledge paths") {
      val f = fixture
      assert(f.defined.interface.get.knowledgePaths.value.size == 1)
      assert(f.empty.interface.get.knowledgePaths.value.isEmpty)
    }

    it("includes excluded files") {
      val f = fixture
      assert(f.defined.interface.get.exclude.value.size == 1)
      assert(f.empty.interface.get.exclude.value.isEmpty)
    }

  }

  describe("changes") {
    it("work for individual fields") {
      val f = fixture
      val newValue = YamlString("New Name")
      f.defined.interface.get.name.set(newValue)
      assert(f.defined.interface.get.name.yamlValue == newValue)
    }

    it("works for lists") {
      val f = fixture
      f.defined.interface.get.parsers.value += YamlString("CSS")
      f.defined.interface.get.parsers.value.toList == List(YamlString("es7"), YamlString("CSS"))
    }

    describe("can can be output") {
      val f = fixture
      f.defined.interface.get.name.set(YamlString("new name"))

      //@todo figure out why this TEST won't pass
//      it("as yaml") {
//        assert(f.defined.yamlValue.prettyPrint ==
////          "name: new name\nknowledge_paths:\n- /docs\nexclude:\n- node_modules/\nknowledge:\n- js:express\nparsers:\n- JavaScript")
//      }

      it("to a file") {
        f.defined.save
        assert(f.defined.file.contentAsString == f.defined.yamlValue.prettyPrint)
      }
    }

  }

  describe("can be reloaded") {
    resetScratch
    it("after change") {
      val f = fixture
      val target = "TESTING!"
      f.defined.interface.get.name.set(YamlString(target))
      f.defined.save
      f.defined.reload
      assert(f.defined.interface.get.name.yamlValue == YamlString(target))
    }

    it("if deleted saves last state") {
      val f = fixture
      val target = "TESTING!"
      f.defined.interface.get.name.set(YamlString(target))
      f.defined.file.delete()
      f.defined.reload
      assert(f.defined.file.exists)
      assert(f.defined.interface.get.name.yamlValue == YamlString(target))
    }

  }

  describe("dependencies") {
    resetScratch
    val f = fixture
    it("can be extracted") {
      val dependencies = f.defined2.dependencies
      assert(dependencies.get ==
        Vector(
          PackageRef("optic:express-js", "0.1.0"),
          PackageRef("optic:react-js", "1.0.0"),
          PackageRef("optic:rest", "latest")))
    }

    it("will fail if contains duplicates") {
      val dependencies = f.defined3.dependencies
      assert(dependencies.failed.get.getLocalizedMessage == "Some packages are defined multiple times: [optic:rest]")
    }

    it("will fail if any packages are not valid ") {
      val dependencies = f.defined4.dependencies
      assert(dependencies.failed.get.getLocalizedMessage == "Some packages are not valid: [optic:react-js@@@1.0.0]")
    }

  }

  describe("hashing") {
    it("can hash a project file/disk state") {
      val f = fixture
      assert(f.defined.hash == f.defined.hash)
    }

    it("knowledge paths are part of hash") {
      val f = fixture
      assert(f.defined5.hash != f.defined6.hash)
    }

  }

}
