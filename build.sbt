name := "optic"
organization := "com.useoptic"

val appVersion = Constants.cliVersion

val scalaTestVersion = "3.0.1"
val akkaHttpVersion = "10.1.1"

libraryDependencies += "org.scalactic" %% "scalactic" % scalaTestVersion
libraryDependencies += "org.scalatest" %% "scalatest" % scalaTestVersion % "test"

libraryDependencies +=  "io.lemonlabs" %% "scala-uri" % "1.3.1"

libraryDependencies += "com.typesafe.akka" %% "akka-http" % akkaHttpVersion
libraryDependencies += "com.typesafe.akka" %% "akka-http-testkit" % akkaHttpVersion
libraryDependencies += "com.typesafe.akka" %% "akka-http-jackson" % akkaHttpVersion
libraryDependencies += "de.heikoseeberger" %% "akka-http-play-json" % "1.19.0-M2"

libraryDependencies += "com.typesafe.play" %% "play-json" % "2.6.11"
libraryDependencies += "io.leonard" %% "play-json-traits" % "1.4.4"

val commonSettings: Seq[Def.Setting[_]] = Seq(
  version := appVersion,
  scalaVersion := "2.12.8",
  test in assembly := {},
  javacOptions ++= Seq("-source", "1.8", "-target", "1.8"), //, "-Xmx2G"),
  scalacOptions ++= Seq("-deprecation", "-unchecked"),
  resolvers += Opts.resolver.mavenLocalFile,
  resolvers ++= Seq(DefaultMavenRepository,
    Resolver.defaultLocal,
    Resolver.mavenLocal
  )
)

lazy val common = (project in file("common")).
  settings(commonSettings: _*)
  .settings(
    version := "0.3.0",
    libraryDependencies ++= Dependencies.commonDependencies
  )

lazy val proxy = (project in file("proxy")).
  settings(commonSettings: _*)
  .dependsOn(common)
  .settings(
    libraryDependencies ++= Dependencies.proxyDependencies
  )
  .settings(
    test in assembly := {},
    assemblyJarName in assembly := "optic-proxy.jar",
    mainClass in assembly := Some("com.useoptic.proxy.Lifecycle"),
    mainClass in packageBin := Some("com.useoptic.proxy.Lifecycle")
  )
  .enablePlugins(AssemblyPlugin)

