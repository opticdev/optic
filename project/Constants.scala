import sbt.File

import scala.io.Source
import scala.util.Try

object Constants {

  val supportedSdks = Seq(
    "0.0.2",
    "0.0.3",
    "0.0.4",
  )

  val cliVersion: String = {
    val versionLine = Source.fromFile("cli/package.json").getLines().find(_.trim.contains(""""version":""")).get
    new scala.util.matching.Regex("[0-9a-z.-]*").findAllIn(versionLine).toList.filterNot(_.isEmpty)(1)
  }

}