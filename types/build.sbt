name := "types"
organization := "com.useoptic"
version := "0.1.0"

scalaVersion := "2.12.10"

val circeVersion = "0.12.3"
libraryDependencies ++= Seq(
  "io.circe" %% "circe-core",
  "io.circe" %% "circe-generic",
  "io.circe" %% "circe-parser",
  "io.circe" %% "circe-literal",
).map(_ % circeVersion % "provided")

libraryDependencies += "com.github.pathikrit" %% "better-files" % "3.8.0" % "test"
libraryDependencies += "com.sksamuel.avro4s" %% "avro4s-core" % "3.0.6" % "provided"
libraryDependencies += "com.sksamuel.avro4s" %% "avro4s-json" % "3.0.6" % "provided"

lazy val root = (project in file("."))
  .settings(
    // The classes that you want to generate typescript interfaces for
    typescriptClassesToGenerateFor := Seq("com.useoptic.types.capture.Capture"),
    // The output file which will contain the typescript interfaces
    typescriptOutputFile := baseDirectory.value / "build" / "optic-types.ts",
    // Include the package(s) of the classes here
    // Optionally import your own TSType implicits to override default default generated
    typescriptGenerationImports := Seq("com.useoptic.types.MyTSTypes._")
  )


