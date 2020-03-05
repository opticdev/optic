import sbtcrossproject.CrossPlugin.autoImport.{CrossType, crossProject}

name := "optic-core"

organization := "com.useoptic"

version := "1.0.0-SNAPSHOT"

scalaVersion := "2.12.10"

val circeVersion = "0.10.0"

lazy val optic =
// select supported platforms
  crossProject(JSPlatform, JVMPlatform)
    .crossType(CrossType.Full) // [Pure, Full, Dummy], default: CrossType.Full
    .settings(
      name := "optic-core",
      version := "0.1-SNAPSHOT",
      libraryDependencies ++= Seq(
        "io.github.cquiroz" %%% "scala-java-time" % "2.0.0-RC2",
        "io.circe" %%% "circe-core" % circeVersion,
        "io.circe" %%% "circe-generic" % circeVersion,
        "io.circe" %%% "circe-parser" % circeVersion,
        "io.circe" %%% "circe-literal" % circeVersion,
        "org.scalactic" %% "scalactic" % "3.1.0",
        "org.scalatest" %% "scalatest" % "3.1.0" % "test",
        "org.scala-js" %% "scalajs-stubs" % scalaJSVersion % "provided",
        "com.github.pathikrit" %% "better-files" % "3.8.0" % "test",
        "com.thesamet.scalapb" %%% "scalapb-runtime" % scalapb.compiler.Version.scalapbVersion,
        "com.thesamet.scalapb" %%% "scalapb-runtime" % scalapb.compiler.Version.scalapbVersion % "protobuf"
      )
    )
    .jsSettings(
      scalaJSLinkerConfig ~= {
        _.withModuleKind(ModuleKind.CommonJSModule)
      }
    ) // defined in sbt-scalajs-crossproject
    .jvmSettings(
      typescriptClassesToGenerateFor := Seq("com.useoptic.types.capture.Capture"),
      // The output file which will contain the typescript interfaces
      typescriptOutputFile := new java.io.File("build/optic-types.ts"),
      // Include the package(s) of the classes here
      // Optionally import your own TSType implicits to override default default generated
      typescriptGenerationImports := Seq("com.useoptic.types.MyTSTypes._"),
      libraryDependencies ++= Seq(
        "com.sksamuel.avro4s" %% "avro4s-core" % "3.0.6",
        "com.sksamuel.avro4s" %% "avro4s-json" % "3.0.6",
        "com.github.pathikrit" %% "better-files" % "3.8.0" % "test"
      )
    )

lazy val opticJS = optic.js
lazy val opticJVM = optic.jvm
