import sbtcrossproject.CrossPlugin.autoImport.{crossProject, CrossType}

name := "optic-core"

organization := "com.useoptic"

version := "1.0.0"

scalaVersion := "2.13.1"

val circeVersion = "0.10.0"
//lazy val opticCore = crossProject.in(file(".")).
//  settings(
//    name := "optic-core",
//    version := "0.1-SNAPSHOT",
//    libraryDependencies ++= Seq(
//      "com.useoptic" %% "types" % "0.1.0",
//      "io.github.cquiroz" %%% "scala-java-time" % "2.0.0-RC2",
//      "io.circe" %%% "circe-core" % circeVersion,
//      "io.circe" %%% "circe-generic" % circeVersion,
//      "io.circe" %%% "circe-parser" % circeVersion,
//      "io.circe" %%% "circe-literal" % circeVersion,
//      "org.scalactic" %% "scalactic" % "3.1.0",
//      "org.scalatest" %% "scalatest" % "3.1.0" % "test",
//      "org.scala-js" %% "scalajs-stubs" % scalaJSVersion % "provided"
//    )
//  ).
//  jvmSettings(
//    libraryDependencies ++= Seq(
//      "io.circe" %% "circe-jawn" % circeVersion
//    )
//  ).
//  jsSettings(
//    scalaJSLinkerConfig ~= { _.withModuleKind(ModuleKind.CommonJSModule) }
//    // Add JS-specific settings here
//  )

//lazy val bar =
//// select supported platforms
//  crossProject(JSPlatform, JVMPlatform)
//    .crossType(CrossType.Pure)
//
//
//lazy val opticCoreJVM = opticCore.jvm
//lazy val opticCoreJS = opticCore.js

lazy val optic =
// select supported platforms
  crossProject(JSPlatform, JVMPlatform)
    .crossType(CrossType.Full) // [Pure, Full, Dummy], default: CrossType.Full
    .settings(
      name := "optic-core",
      version := "0.1-SNAPSHOT",
      libraryDependencies ++= Seq(
        "com.useoptic" %% "types" % "0.1.0",
        "io.github.cquiroz" %%% "scala-java-time" % "2.0.0-RC2",
        "io.circe" %%% "circe-core" % circeVersion,
        "io.circe" %%% "circe-generic" % circeVersion,
        "io.circe" %%% "circe-parser" % circeVersion,
        "io.circe" %%% "circe-literal" % circeVersion,
        "org.scalactic" %% "scalactic" % "3.1.0",
        "org.scalatest" %% "scalatest" % "3.1.0" % "test",
        "org.scala-js" %% "scalajs-stubs" % scalaJSVersion % "provided"
      )
    )
    .jsSettings(
      scalaJSLinkerConfig ~= { _.withModuleKind(ModuleKind.CommonJSModule) }
    ) // defined in sbt-scalajs-crossproject
    .jvmSettings(/* ... */)

lazy val opticJS = optic.js
lazy val opticJVM = optic.jvm
