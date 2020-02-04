import org.scalajs.sbtplugin.ScalaJSPlugin.autoImport._
import sbt._
import sbt.Keys._

name := "optic-core"

organization := "com.useoptic"

version := "1.0.0"


scalaVersion := "2.12.10"

enablePlugins(ScalaJSPlugin)
scalaJSLinkerConfig ~= { _.withModuleKind(ModuleKind.CommonJSModule) }

val circeVersion = "0.10.0"

libraryDependencies += "com.useoptic" %% "types" % "0.1.0"

libraryDependencies += "io.github.cquiroz" %% "scala-java-time" % "2.0.0-RC2"
libraryDependencies += "io.github.cquiroz" %%% "scala-java-time" % "2.0.0-RC2"
libraryDependencies ++= Seq(
  "io.circe" %%% "circe-core",
  "io.circe" %%% "circe-generic",
  "io.circe" %%% "circe-parser",
  "io.circe" %%% "circe-literal",
).map(_ % circeVersion)

//for tests only
libraryDependencies += "org.scalactic" %% "scalactic" % "3.1.0"
libraryDependencies += "org.scalatest" %% "scalatest" % "3.1.0" % "test"
libraryDependencies += "org.scalameta" %% "scalameta" % "4.1.9" % "test"
libraryDependencies += "org.scala-lang.modules" %% "scala-async" % "0.10.0"
libraryDependencies += "io.circe" %% "circe-jawn" % "0.10.0" % "test"

