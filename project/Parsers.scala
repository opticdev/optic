import sbt._
import Keys._

object Parsers {
  val list: Seq[ModuleID] =  Seq(
    "com.opticdev.parsers" %% "es7" % "1.0.2",
    "com.opticdev.parsers" %% "scala" % "0.0.1"
  )
}
