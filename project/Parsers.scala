import sbt._
import Keys._

object Parsers {
  val list: Seq[ModuleID] =  Seq(
    "com.opticdev.parsers" %% "es7" % "1.2.0",
//    "com.opticdev.parsers" %% "scala" % "0.0.1"
  )
}