name := "oas"

version := "0.1"

scalaVersion := "2.12.8"

libraryDependencies += "com.seamless" % "seamless-ddd_sjs0.6_2.12" % "0.1"
libraryDependencies += "com.typesafe.play" %% "play-json" % "2.7.2"


// Test Dependencies
libraryDependencies += "com.github.pathikrit" %% "better-files" % "3.8.0" % "test"
libraryDependencies += "io.circe" %% "circe-yaml" % "0.9.0" % "test"
libraryDependencies += "org.scalactic" %% "scalactic" % "3.0.5"
libraryDependencies += "org.scalatest" %% "scalatest" % "3.0.5" % "test"