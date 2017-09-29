name := "optic-core"

organization := "com.opticdev"

version := "1.0"

scalaVersion := "2.12.3"

libraryDependencies += "com.opticdev" %% "parser-foundation" % "1.0.0"
libraryDependencies += "com.opticdev" %% "marvin-runtime" % "1.0.0"

//graph
libraryDependencies += "org.scala-graph" %% "graph-core" % "1.12.0"

//io
libraryDependencies += "com.github.pathikrit" % "better-files_2.12" % "2.17.1"
libraryDependencies +=   "com.github.pathikrit"  %% "better-files-akka"  % "2.17.1"

libraryDependencies += "commons-io" % "commons-io" % "2.4"
libraryDependencies += "io.suzaku" %% "boopickle" % "1.2.6"

//test suites
libraryDependencies += "org.scalactic" %% "scalactic" % "3.0.1"
libraryDependencies += "org.scalatest" %% "scalatest" % "3.0.1" % "test"

//json
libraryDependencies += "com.typesafe.play" %% "play-json" % "2.6.2"
libraryDependencies += "com.github.fge" % "json-schema-validator" % "2.2.6"
libraryDependencies += "org.gnieh" %% "diffson-play-json" % "2.2.1"

//cli
libraryDependencies += "com.github.scopt" %% "scopt" % "3.6.0"

//for server
libraryDependencies += "com.typesafe.akka" %% "akka-http-core" % "10.0.10"
libraryDependencies += "com.typesafe.akka" %% "akka-http" % "10.0.10"
libraryDependencies += "com.typesafe.akka" %% "akka-http-testkit" % "10.0.10"
libraryDependencies += "com.typesafe.akka" %% "akka-http-spray-json" % "10.0.10"
libraryDependencies += "com.typesafe.akka" %% "akka-http-jackson" % "10.0.10"
libraryDependencies += "com.typesafe.akka" %% "akka-http-xml" % "10.0.10"

//for concurrency
libraryDependencies += "com.typesafe.akka" %% "akka-actor" % "2.5.4"

