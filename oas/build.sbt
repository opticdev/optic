name := "oas"

version := "0.1"

organization := "com.seamless"
scalaVersion := "2.12.8"

libraryDependencies += "com.seamless" % "seamless-ddd_sjs0.6_2.12" % "0.1"
libraryDependencies += "com.typesafe.play" %% "play-json" % "2.7.2"
libraryDependencies += "io.circe" %% "circe-yaml" % "0.9.0"

// Test Dependencies
libraryDependencies += "com.github.pathikrit" %% "better-files" % "3.8.0" % "test"
libraryDependencies += "org.scalactic" %% "scalactic" % "3.0.5"
libraryDependencies += "org.scalatest" %% "scalatest" % "3.0.5" % "test"

val circeVersion = "0.10.0"

libraryDependencies ++= Seq(
  "io.circe" %% "circe-core",
  "io.circe" %% "circe-generic",
  "io.circe" %% "circe-parser"
).map(_ % circeVersion)

