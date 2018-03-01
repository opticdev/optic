package com.opticdev.arrow.changes.location

import better.files.File
import com.opticdev.arrow.changes.ExampleChanges.simpleModelInsert
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor
import org.scalatest.FunSpec

class InsertLocationSpec extends TestBase with GearUtils {
  //uses built-in sourcegear with nothing but a parser

  implicit val filesStateMonitor = new FileStateMonitor

  val example1 = File("test-examples/resources/example_source/InsertAtLocation/file1.js")
  val example2 = File("test-examples/resources/example_source/InsertAtLocation/file2.js")


  describe("Raw position") {
    it("always returns the raw position") {
      val rp = RawPosition(example1, 22)
      assert(rp.resolveToLocation(sourceGear).get == ResolvedRawLocation(22, sourceGear.parsers.head))
    }
  }

  describe("As Child Of") {

    it("can find its place in the top level of a file") {
      val aco = AsChildOf(example1, 19)

      val result = aco.resolveToLocation(sourceGear).get

      assert(result.index == 1)
      assert(result.parent.nodeType.name == "Program")

    }

    it("can find its place when nested") {
      val aco = AsChildOf(example2, 168)

      val result = aco.resolveToLocation(sourceGear).get

      assert(result.index == 3)
      assert(result.parent.nodeType.name == "BlockStatement")
    }

  }



}
