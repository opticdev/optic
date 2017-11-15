package com.opticdev.core.Fixture.compilerUtils

import com.opticdev.core.compiler.Compiler.CompileWorker
import com.opticdev.core.compiler.Compiler
import com.opticdev.parsers.ParserBase
import play.api.libs.json.Json
import com.opticdev.core.sdk.SdkDescription
import com.opticdev.core.sourcegear.{Gear, SourceGear}
import com.opticdev.parsers.SourceParserManager

import scala.collection.mutable.ListBuffer
import scala.io.Source

trait GearUtils {

  val sourceGear = new SourceGear {
    override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
  }

  def gearFromDescription(path: String): Gear = {
    val jsonString = Source.fromFile(path).getLines.mkString
    val description = SdkDescription.fromJson(Json.parse(jsonString))


    val worker = new CompileWorker(description.lenses.head)
    val result = worker.compile()(description.schemas, description.lenses, ListBuffer())

    result.get
  }

  def gearsFromDescription(path: String) : Seq[Gear] = {
    val jsonString = Source.fromFile(path).getLines.mkString
    val descriptions = SdkDescription.fromJson(Json.parse(jsonString))

    descriptions.lenses.map(i=> {
      val worker = new CompileWorker(i)
      val compileResult = worker.compile()(descriptions.schemas, descriptions.lenses, ListBuffer())
      compileResult.get
    })
  }

  def sourceGearFromDescription(path: String) : SourceGear = {

    val jsonString = Source.fromFile(path).getLines.mkString
    val description = SdkDescription.fromJson(Json.parse(jsonString))

    val compiled = Compiler.setup(description).execute

    if (compiled.isFailure) throw new Error("Compiling description failed. Test Stopped")

    sourceGear.gearSet.addGears(compiled.gears.toSeq:_*)

    sourceGear

  }

}
