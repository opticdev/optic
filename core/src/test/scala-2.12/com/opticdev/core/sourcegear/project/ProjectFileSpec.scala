package com.opticdev.core.sourcegear.project

import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.InvalidProjectFileException
import com.opticdev.core.sourcegear.project.config.ProjectFile
import net.jcazevedo.moultingyaml.YamlString

class ProjectFileSpec extends TestBase {

  describe("Project file") {

    describe("instantiates from a YAML file") {
      it("should work when valid") {
        new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/project.optic"))
      }
      it("should throw if the file does not exist") {
        assertThrows[InvalidProjectFileException] {
          new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/notReal.optic"), false)
        }
      }
      it("should throw when file is invalid YAML") {
        assertThrows[InvalidProjectFileException] {
          new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/invalidFile.optic"), false)
        }
      }
    }


    def fixture = new {
      val defined = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/project.optic"))
      val empty = new ProjectFile(File(getCurrentDirectory + "/test-examples/resources/tmp/example_project_files/empty.optic"))
    }


    describe("fields") {

      it("includes name") {
        val f = fixture
        assert(f.defined.interface.name.yamlValue == YamlString("Test project"))
        assert(f.empty.interface.name.yamlValue == YamlString("Unnamed Project"))
      }

      it("includes parsers") {
        val f = fixture
        assert(f.defined.interface.parsers.value.size == 1)
        assert(f.empty.interface.parsers.value.isEmpty)
      }

      it("includes knowledge") {
        val f = fixture
        assert(f.defined.interface.knowledge.value.size == 1)
        assert(f.empty.interface.knowledge.value.isEmpty)
      }

      it("includes ignored files") {
        val f = fixture
        assert(f.defined.interface.ignored_files.value.size == 1)
        assert(f.empty.interface.ignored_files.value.isEmpty)
      }

    }

    describe("changes") {
      it("work for individual fields") {
        val f = fixture
        val newValue = YamlString("New Name")
        f.defined.interface.name.set(newValue)
        assert(f.defined.interface.name.yamlValue == newValue)
      }

      it("works for lists") {
        val f = fixture
        f.defined.interface.parsers.value += YamlString("CSS")
        f.defined.interface.parsers.value.toList == List(YamlString("JavaScript"), YamlString("CSS"))
      }

      describe("can can be output") {
        val f = fixture
        f.defined.interface.name.set(YamlString("new name"))
        it("as yaml") {
          assert(f.defined.yamlValue.prettyPrint == "name: new name\nparsers:\n- JavaScript\nknowledge:\n- js.express\nignored_files:\n- node_modules/\n")
        }

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
        f.defined.interface.name.set(YamlString(target))
        f.defined.save
        f.defined.reload
        assert(f.defined.interface.name.yamlValue == YamlString(target))
      }

      it("if deleted saves last state") {
        val f = fixture
        val target = "TESTING!"
        f.defined.interface.name.set(YamlString(target))
        f.defined.file.delete()
        f.defined.reload
        assert(f.defined.file.exists)
        assert(f.defined.interface.name.yamlValue == YamlString(target))
      }

    }

  }
}
