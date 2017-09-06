package Fixture.compilerUtils

import play.api.libs.json.Json
import sdk.SdkDescription
import sourcegear.Gear

import scala.collection.mutable.ListBuffer
import scala.io.Source

trait GearUtils {
  def gearFromDescription(path: String): Gear = {
    val jsonString = Source.fromFile(path).getLines.mkString
    val description = SdkDescription.fromJson(Json.parse(jsonString))

    val worker = new compiler_new.Compiler.CompileWorker(description.lenses.head)
    val result = worker.compile()(description.schemas, description.lenses, ListBuffer())

    result.get
  }
}
