name := "optic-proxy"

version := "0.1"

scalaVersion := "2.12.8"


val scalaTestVersion = "3.0.1"
val akkaHttpVersion = "10.1.1"

libraryDependencies += "org.scalactic" %% "scalactic" % scalaTestVersion
libraryDependencies += "org.scalatest" %% "scalatest" % scalaTestVersion % "test"

libraryDependencies +=  "org.scalaj" %% "scalaj-http" % "2.4.1"
libraryDependencies +=  "io.lemonlabs" %% "scala-uri" % "1.3.1"

libraryDependencies += "com.typesafe.akka" %% "akka-http" % akkaHttpVersion
libraryDependencies += "com.typesafe.akka" %% "akka-http-testkit" % akkaHttpVersion
libraryDependencies += "com.typesafe.akka" %% "akka-http-jackson" % akkaHttpVersion
libraryDependencies += "de.heikoseeberger" %% "akka-http-play-json" % "1.19.0-M2"

libraryDependencies += "com.typesafe.play" %% "play-json" % "2.6.11"
libraryDependencies += "io.leonard" %% "play-json-traits" % "1.4.4"

