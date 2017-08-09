name := "optic-core"

organization := "com.optic-dev"

version := "1.0"

scalaVersion := "2.12.3"


libraryDependencies += "com.optic-dev" %% "parser-base" % "1.0.0"

//io
libraryDependencies += "com.github.pathikrit" % "better-files_2.12" % "2.17.1"
libraryDependencies += "commons-io" % "commons-io" % "2.4"

//test suites
libraryDependencies += "org.scalactic" %% "scalactic" % "3.0.1"
libraryDependencies += "org.scalatest" %% "scalatest" % "3.0.1" % "test"


//json
libraryDependencies += "com.typesafe.play" %% "play-json" % "2.6.2"
libraryDependencies += "com.github.fge" % "json-schema-validator" % "2.2.6"
libraryDependencies += "org.gnieh" %% "diffson-play-json" % "2.2.1"

//cli
libraryDependencies += "com.github.scopt" %% "scopt" % "3.6.0"


