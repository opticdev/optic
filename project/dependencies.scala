import sbt._
import Keys._

object Dependencies {

  object Versions {
    val betterFilesVersion = "2.17.1"
    val scalaTestVersion = "3.0.1"
    val parserFoundationVersion = "0.1.5"
    val akkaHttpVersion = "10.1.1"
    val marvinVersion = "0.1.4"
  }

  import Versions._

  val sharedDependencies : Seq[ModuleID] = Seq(
    //tests
    "org.scalactic" %% "scalactic" % scalaTestVersion,
    "org.scalatest" %% "scalatest" % scalaTestVersion % "test",

    "com.opticdev" %% "parser-foundation" % parserFoundationVersion,

    //file library
    "com.github.pathikrit" % "better-files_2.12" % betterFilesVersion,
    "com.github.pathikrit" %% "better-files-akka" % betterFilesVersion,

    "org.scala-lang.modules" %% "scala-xml" % "1.1.0",

    //graph
    "org.scala-graph" %% "graph-core" % "1.12.3",
    "org.scala-graph" %% "graph-constrained" % "1.12.3"
  )

  val commonDependencies: Seq[ModuleID] =  Seq(
    "org.apache.commons" % "commons-lang3" % "3.6",
    "com.github.pathikrit" % "better-files_2.12" % betterFilesVersion,
    "com.typesafe.play" %% "play-json" % "2.6.2",
    "org.scalactic" %% "scalactic" % scalaTestVersion,
    "org.scalatest" %% "scalatest" % scalaTestVersion % "test",
    "com.vdurmont" % "semver4j" % "2.2.0",
    "org.slf4j" % "slf4j-simple" % "1.7.25" % "test",
    "com.opticdev" %% "parser-foundation" % parserFoundationVersion
  ) ++ Parsers.list

  val sdkDependencies: Seq[ModuleID] = sharedDependencies ++ Seq(
    "com.typesafe.play" %% "play-json" % "2.6.2",
    "com.github.fge" % "json-schema-validator" % "2.2.6",
    "org.gnieh" %% "diffson-play-json" % "2.2.1",
    "org.apache.commons" % "commons-compress" % "1.16.1",
    "net.jcazevedo" %% "moultingyaml" % "0.4.0"
  )

  val serverDependencies : Seq[ModuleID] = sharedDependencies ++ Seq(
    "com.typesafe.akka" %% "akka-http" % akkaHttpVersion,
    "com.typesafe.akka" %% "akka-http-testkit" % akkaHttpVersion,
    "com.typesafe.akka" %% "akka-http-jackson" % akkaHttpVersion,
    "de.heikoseeberger" %% "akka-http-play-json" % "1.19.0-M2",

    "com.typesafe.play" %% "play-json" % "2.6.2",
    "com.github.fge" % "json-schema-validator" % "2.2.6",
    "org.gnieh" %% "diffson-play-json" % "2.2.1",

    //for concurrency
    "com.typesafe.akka" %% "akka-actor" % "2.5.4",
    "com.typesafe.akka" %% "akka-stream" % "2.5.4",

    "org.awaitility" % "awaitility-scala" % "3.0.0",

    "com.typesafe.play" %% "play-ws-standalone" % "1.1.3",
    "com.typesafe.play" %% "play-ahc-ws-standalone" % "1.1.2",
    "com.typesafe.play" %% "play-ws-standalone-json" % "1.1.2",

    "ch.megard" %% "akka-http-cors" % "0.2.2",

    "com.opticdev" %% "optic-plugins-installer" % "0.2.0"
  )

  val coreDependencies : Seq[ModuleID] = sharedDependencies ++ Seq(
    "com.typesafe.play" %% "play-json" % "2.6.2",
    "com.github.fge" % "json-schema-validator" % "2.2.6",
    "org.gnieh" %% "diffson-play-json" % "2.2.1",

    "commons-io" % "commons-io" % "2.4",
    "io.suzaku" %% "boopickle" % "1.2.6",

    "com.typesafe.akka" %% "akka-http-jackson" % akkaHttpVersion,
    "de.heikoseeberger" %% "akka-http-play-json" % "1.19.0-M2",
    "ch.megard" %% "akka-http-cors" % "0.2.2",

    //for concurrency
    "com.typesafe.akka" %% "akka-actor" % "2.5.4",
    "com.typesafe.akka" %% "akka-stream" % "2.5.4",
    "com.opticdev" %% "akka-faddish-mailbox" % "0.1.0",

    "net.jcazevedo" %% "moultingyaml" % "0.4.0",
    "com.opticdev" %% "marvin-runtime" % marvinVersion,
    "com.opticdev" %% "marvin-common" % marvinVersion
  )

  val opmDependencies : Seq[ModuleID] = sharedDependencies ++ Seq(
    "net.jcazevedo" %% "moultingyaml" % "0.4.0",
    "com.typesafe.play" %% "play-json" % "2.6.2",
    "com.typesafe.play" %% "play-ws-standalone" % "1.1.3",
    "com.typesafe.play" %% "play-ahc-ws-standalone" % "1.1.2",
    "com.typesafe.play" %% "play-ws-standalone-json" % "1.1.2",
    "com.opticdev" %% "marvin-runtime" % marvinVersion,
    "com.opticdev" %% "marvin-common" % marvinVersion,
    "com.vdurmont" % "semver4j" % "2.1.0",
    "com.typesafe.akka" %% "akka-http" % akkaHttpVersion,
    "com.typesafe.akka" %% "akka-http-testkit" % akkaHttpVersion
  ) ++ Parsers.list

  val cliDependencies : Seq[ModuleID] = sharedDependencies ++ Seq(
    "com.github.scopt" %% "scopt" % "3.7.0",
    "com.typesafe.akka" %% "akka-http" % akkaHttpVersion,
    "com.typesafe.akka" %% "akka-stream" % "2.5.4"
  )

}