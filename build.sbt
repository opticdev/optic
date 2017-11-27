name := "optic-core"

organization := "com.opticdev"

version := "1.0"

scalaVersion := "2.12.3"


/* Project Components */
lazy val common = project.
 settings(Common.settings: _*)
 .settings(libraryDependencies ++= Dependencies.commonDependencies)

lazy val sdk = project.
  settings(Common.settings: _*)
  .settings(libraryDependencies ++= Dependencies.sdkDependencies)

lazy val opm = project.
 settings(Common.settings: _*)
 .settings(libraryDependencies ++= Dependencies.opmDependencies)
 .dependsOn(common)
 .dependsOn(sdk)

lazy val core = project.
  settings(Common.settings: _*)
  .settings(libraryDependencies ++= Dependencies.coreDependencies)
  .dependsOn(common)
  .dependsOn(sdk)
  .dependsOn(opm)
  .dependsOn(opm % "compile->compile;test->test")

lazy val server = project.
 settings(Common.settings: _*)
 .settings(libraryDependencies ++= Dependencies.serverDependencies)
 .dependsOn(sdk)
 .dependsOn(common)
 .dependsOn(core)
 .dependsOn(core % "compile->compile;test->test")

lazy val root = (project in file(".")).
 aggregate(common, sdk, opm, server, core)


concurrentRestrictions in Global += Tags.limit(Tags.Test, 1)

assemblyJarName in assembly := "optic.jar"
mainClass in assembly := Some("com.opticdev.server.http.Lifecycle")