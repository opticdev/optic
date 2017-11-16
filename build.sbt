name := "optic-core"

organization := "com.opticdev"

version := "1.0"

scalaVersion := "2.12.3"


/* Project Components */
lazy val common = project.
 settings(Common.settings: _*)
 .settings(libraryDependencies ++= Dependencies.commonDependencies)

lazy val opm = project.
 settings(Common.settings: _*)
 .settings(libraryDependencies ++= Dependencies.opmDependencies)
 .dependsOn(common)

lazy val core = project.
  settings(Common.settings: _*)
  .settings(libraryDependencies ++= Dependencies.coreDependencies)
  .dependsOn(common)
  .dependsOn(opm)

lazy val server = project.
 settings(Common.settings: _*)
 .settings(libraryDependencies ++= Dependencies.serverDependencies)
 .dependsOn(common)
 .dependsOn(core)
 .dependsOn(core % "compile->compile;test->test")

lazy val root = (project in file(".")).
 aggregate(common, opm, server, core)



//
//assemblyJarName in assembly := "optic.jar"
//test in assembly := {}
//mainClass in assembly := Some("com.opticdev.server.http.Lifecycle")


