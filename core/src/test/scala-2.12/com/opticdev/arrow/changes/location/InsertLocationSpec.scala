package com.opticdev.arrow.changes.location

import better.files.File
import com.opticdev.arrow.changes.ExampleChanges.simpleModelInsert
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor
import com.opticdev.parsers.SourceParserManager
import com.opticdev.sdk.descriptions.transformation.generate.{RenderOptions, StagedNode}
import org.scalatest.FunSpec

class InsertLocationSpec extends TestBase with GearUtils {
  //uses built-in sourcegear with nothing but a parser

  implicit val filesStateMonitor = new FileStateMonitor

  val example1 = File("test-examples/resources/example_source/InsertAtLocation/file1.js")
  val example2 = File("test-examples/resources/example_source/InsertAtLocation/file2.js")


  describe("Raw position") {
    it("always returns the raw position") {
      val rp = RawPosition(example1, 22)
      assert(rp.resolveToLocation(sourceGear).get == ResolvedRawLocation(example1, 22, sourceGear.parsers.head))
    }

    it("is overriden by a staged node with a custom file set") {
      val rp = RawPosition(example1, 22)

      assert(rp.resolveToLocation(sourceGear, Some(StagedNode(null, null, Some(RenderOptions(
        inFile = Some("path/to/override.js")
      ))))).get == EndOfFile(File("path/to/override.js"), SourceParserManager.installedParsers.head))

    }
  }


  describe("As Child Of") {

    it("can find its place in the top level of a file") {
      val aco = AsChildOf(example1, 19)

      val result = aco.resolveToLocation(sourceGear).get

      assert(result.asInstanceOf[ResolvedChildInsertLocation].index == 1)
      assert(result.asInstanceOf[ResolvedChildInsertLocation].parent.nodeType.name == "Program")

    }

    it("can find its place when nested") {
      val aco = AsChildOf(example2, 168)

      val result = aco.resolveToLocation(sourceGear).get

      assert(result.asInstanceOf[ResolvedChildInsertLocation].index == 3)
      assert(result.asInstanceOf[ResolvedChildInsertLocation].parent.nodeType.name == "BlockStatement")
    }

    it("is overriden by a staged node with a custom file set") {
      val aco = AsChildOf(example2, 168)

      assert(aco.resolveToLocation(sourceGear, Some(StagedNode(null, null, Some(RenderOptions(
        inFile = Some("path/to/override.js")
      ))))).get == EndOfFile(File("path/to/override.js"), SourceParserManager.installedParsers.head))

    }

  }



}
