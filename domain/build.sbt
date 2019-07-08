import org.scalajs.sbtplugin.ScalaJSPlugin.autoImport._
import sbt._
import sbt.Keys._

name := "seamless-ddd"

organization := "com.seamless"

version := "0.1"


scalaVersion := "2.12.8"

libraryDependencies += "org.scalactic" %% "scalactic" % "3.0.5"
libraryDependencies += "org.scalatest" %% "scalatest" % "3.0.5" % "test"

enablePlugins(ScalaJSPlugin)
scalaJSLinkerConfig ~= { _.withModuleKind(ModuleKind.CommonJSModule) }

val circeVersion = "0.10.0"

libraryDependencies ++= Seq(
  "io.circe" %%% "circe-core",
  "io.circe" %%% "circe-generic",
  "io.circe" %%% "circe-parser"
).map(_ % circeVersion)

//for tests only
libraryDependencies += "org.scalameta" %% "scalameta" % "4.1.9" % "test"

//generateTypescript := {
//  PlatformTokenizerCache.megaCache.clear()
//  val outputFile = outputDir.value / (jsOutputName.value + ".d.ts")
//  val sources:Seq[Source] = (unmanagedSources in Compile).value.map { file =>
//    // Workaround for https://github.com/scalameta/scalameta/issues/874
//    new ScalametaParser(Input.File(file), dialects.ParadiseTypelevel212).parseSource()
//  }
//
//  val content = TypescriptExport(sources)
//
//  IO.write(outputFile, content, scala.io.Codec.UTF8.charSet)
//  outputFile
//}