name := "optic-core"

organization := "com.opticdev"

version := "0.1.0"

scalaVersion := "2.12.3"


/* Sub Projects */
lazy val common = (project in file("common")).
 settings(Common.settings: _*)
 .settings(libraryDependencies ++= Dependencies.commonDependencies)

lazy val sdk = (project in file("sdk")).
  settings(Common.settings: _*)
  .settings(libraryDependencies ++= Dependencies.sdkDependencies)
  .dependsOn(common)

lazy val opm = (project in file("opm")).
 settings(Common.settings: _*)
 .settings(libraryDependencies ++= Dependencies.opmDependencies)
 .dependsOn(common)
 .dependsOn(sdk)

lazy val core = (project in file("core")).
  settings(Common.settings: _*)
  .settings(libraryDependencies ++= Dependencies.coreDependencies)
  .dependsOn(common)
  .dependsOn(sdk)
  .dependsOn(opm)
  .dependsOn(opm % "compile->compile;test->test")

lazy val arrow = (project in file("arrow")).
  settings(Common.settings: _*)
  .settings(libraryDependencies ++= Dependencies.arrowDependencies)
  .dependsOn(core)
  .dependsOn(sdk)

lazy val server = (project in file("server")).
 settings(Common.settings: _*)
 .settings(libraryDependencies ++= Dependencies.serverDependencies)
 .dependsOn(sdk)
 .dependsOn(common)
 .dependsOn(core)
 .dependsOn(arrow)
 .dependsOn(core % "compile->compile;test->test")

lazy val root = (project in file(".")).
 aggregate(common, sdk, opm, server, core)


concurrentRestrictions in Global += Tags.limit(Tags.Test, 1)

assemblyJarName in assembly := "optic.jar"
mainClass in assembly := Some("com.opticdev.server.http.Lifecycle")