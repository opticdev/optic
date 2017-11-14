import sbt._
import Keys._

object Dependencies {
  val mainDependencies : Seq[ModuleID] = Seq(
    //optic
    "com.opticdev" %% "parser-foundation" % "1.0.0",
    "com.opticdev" %% "marvin-runtime" % "1.0.0",
    "com.opticdev" %% "common" % "1.0.0",

    //package manager
    "com.vdurmont" % "semver4j" % "2.1.0",


    //client http
    "com.typesafe.play" %% "play-ws-standalone" % "1.1.3",
    "com.typesafe.play" %% "play-ahc-ws-standalone" % "1.1.2",
    "com.typesafe.play" %% "play-ws-standalone-json" % "1.1.2",

    //graph
    "org.scala-graph" %% "graph-core" % "1.12.0",

    //io
    "com.github.pathikrit" % "better-files_2.12" % "2.17.1",
    "com.github.pathikrit" %% "better-files-akka" % "2.17.1",
    "commons-io" % "commons-io" % "2.4",
    "io.suzaku" %% "boopickle" % "1.2.6",

    //test suites
    "org.scalactic" %% "scalactic" % "3.0.1",
    "org.scalatest" %% "scalatest" % "3.0.1" % "test",

    //json
    "com.typesafe.play" %% "play-json" % "2.6.2",
    "com.github.fge" % "json-schema-validator" % "2.2.6",
    "org.gnieh" %% "diffson-play-json" % "2.2.1",

    //yaml
    "net.jcazevedo" %% "moultingyaml" % "0.4.0",

    //cli,
    "com.github.scopt" %% "scopt" % "3.6.0",
    "com.lihaoyi" %% "fansi" % "0.2.5",
    "me.tongfei" % "progressbar" % "0.5.5",

    //for server
    "com.typesafe.akka" %% "akka-http" % "10.0.10",
    "com.typesafe.akka" %% "akka-http-testkit" % "10.0.10",
    "com.typesafe.akka" %% "akka-http-jackson" % "10.0.10",
    "de.heikoseeberger" %% "akka-http-play-json" % "1.19.0-M2",

    //for concurrency
    "com.typesafe.akka" %% "akka-actor" % "2.5.4",
    "com.typesafe.akka" %% "akka-stream" % "2.5.4",

    //logging
    "org.slf4j" % "slf4j-simple" % "1.7.25" % "test"
  )
}