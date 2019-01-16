import sbt._
import Keys.{libraryDependencies, _}

object Dependencies {

  object Versions {
    val scalaTestVersion = "3.0.1"
    val akkaHttpVersion = "10.1.1"
    val marvinVersion = "0.2.1"
    val parserFoundationVersion = "0.2.1"
  }

  import Versions._

  val sharedDependencies : Seq[ModuleID] = Seq(
    "org.scalactic" %% "scalactic" % scalaTestVersion,
    "org.scalatest" %% "scalatest" % scalaTestVersion % "test",
    "io.leonard" %% "play-json-traits" % "1.4.4",
    "com.typesafe.play" %% "play-json" % "2.6.11",
    "io.lemonlabs" %% "scala-uri" % "1.3.1"
  )

  val commonDependencies: Seq[ModuleID] = sharedDependencies ++ Seq(

  )

  val proxyDependencies: Seq[ModuleID] = sharedDependencies ++ Seq(
    "com.typesafe.akka" %% "akka-http" % akkaHttpVersion,
    "com.typesafe.akka" %% "akka-http-testkit" % akkaHttpVersion,
    "com.typesafe.akka" %% "akka-http-jackson" % akkaHttpVersion,
    "de.heikoseeberger" %% "akka-http-play-json" % "1.19.0-M2"
  )
  
}