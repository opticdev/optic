package Fixture.compilerUtils

import optic.parsers.ParserBase
import play.api.libs.json.Json
import sdk.SdkDescription
import sourcegear.{Gear, SourceGear}

import scala.collection.mutable.ListBuffer
import scala.io.Source

trait GearUtils {
  def gearFromDescription(path: String): Gear = {
    val jsonString = Source.fromFile(path).getLines.mkString
    val description = SdkDescription.fromJson(Json.parse(jsonString))

    val worker = new compiler.Compiler.CompileWorker(description.lenses.head)
    val result = worker.compile()(description.schemas, description.lenses, ListBuffer())

    result.get
  }

  def sourceGearFromDescription(path: String) : SourceGear = {

    val sourceGear = new SourceGear {
      override val parser: Set[ParserBase] = Set()
    }

    val jsonString = Source.fromFile("src/test/resources/sdkDescriptions/RequestSdkDescription.json").getLines.mkString
    val description = SdkDescription.fromJson(Json.parse(jsonString))

    val compiled = compiler.Compiler.setup(description).execute

    if (compiled.isFailure) throw new Error("Compiling description failed. Test Stopped")

    sourceGear.gearSet.addGears(compiled.gears.toSeq:_*)

    sourceGear

  }

}
