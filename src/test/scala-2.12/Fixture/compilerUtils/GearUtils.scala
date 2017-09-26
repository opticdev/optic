package Fixture.compilerUtils

import com.opticdev.core.compiler.Compiler.CompileWorker
import com.opticdev.core.compiler.Compiler
import com.opticdev.parsers.ParserBase
import play.api.libs.json.Json
import com.opticdev.core.sdk.SdkDescription
import com.opticdev.core.sourcegear.{Gear, SourceGear}
import com.opticdev.core.sourceparsers.SourceParserManager

import scala.collection.mutable.ListBuffer
import scala.io.Source

trait GearUtils {
  def gearFromDescription(path: String): Gear = {
    val jsonString = Source.fromFile(path).getLines.mkString
    val description = SdkDescription.fromJson(Json.parse(jsonString))


    val worker = new CompileWorker(description.lenses.head)
    val result = worker.compile()(description.schemas, description.lenses, ListBuffer())

    result.get
  }

  def sourceGearFromDescription(path: String) : SourceGear = {

    val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.getInstalledParsers
    }

    val jsonString = Source.fromFile("src/test/resources/sdkDescriptions/RequestSdkDescription.json").getLines.mkString
    val description = SdkDescription.fromJson(Json.parse(jsonString))

    val compiled = Compiler.setup(description).execute

    if (compiled.isFailure) throw new Error("Compiling description failed. Test Stopped")

    sourceGear.gearSet.addGears(compiled.gears.toSeq:_*)

    sourceGear

  }

}
