import sbtbuildinfo.BuildInfoPlugin.autoImport.buildInfoPackage

import scala.io.Source
import scala.util.Try

name := "optic-core"

organization := "com.opticdev"

val appVersion = "1.0.4"

version := appVersion

val commonSettings: Seq[Def.Setting[_]] = Seq(
  version := appVersion,
  scalaVersion := "2.12.4",
  test in assembly := {},
  javacOptions ++= Seq("-source", "1.8", "-target", "1.8"), //, "-Xmx2G"),
  scalacOptions ++= Seq("-deprecation", "-unchecked"),
  resolvers += Opts.resolver.mavenLocalFile,
  resolvers ++= Seq(DefaultMavenRepository,
    Resolver.defaultLocal,
    Resolver.mavenLocal
  )
)

/* Sub Projects */
lazy val common = (project in file("common")).
 settings(commonSettings: _*)
 .enablePlugins(BuildInfoPlugin)
 .settings(
   libraryDependencies ++= Dependencies.commonDependencies,
   buildInfoKeys := Seq[BuildInfoKey](
     "opticMDVersion" -> Constants.opticMDVersion,
     "currentOpticVersion" -> version,
   ),
   buildInfoPackage := "com.opticdev.common"
 )

lazy val sdk = (project in file("sdk")).
  enablePlugins(BuildInfoPlugin).
  settings(commonSettings: _*)
  .settings(
    libraryDependencies ++= Dependencies.sdkDependencies,
    buildInfoKeys := Seq[BuildInfoKey](
      "opticMDVersion" -> Constants.opticMDVersion,
    ),
    buildInfoPackage := "com.opticdev.sdk"
  )
  .dependsOn(common)

lazy val opm = (project in file("opm")).
 settings(commonSettings: _*)
 .settings(libraryDependencies ++= Dependencies.opmDependencies)
 .dependsOn(common)
 .dependsOn(sdk)

lazy val cli = (project in file("cli")).
  settings(commonSettings: _*)
  .settings(libraryDependencies ++= Dependencies.cliDependencies)
  .dependsOn(common)

lazy val core = (project in file("core")).
  settings(commonSettings: _*)
  .settings(libraryDependencies ++= Dependencies.coreDependencies)
  .dependsOn(common)
  .dependsOn(sdk)
  .dependsOn(opm)
  .dependsOn(opm % "compile->compile;test->test")

lazy val server = (project in file("server")).
 settings(commonSettings: _*)
 .enablePlugins(BuildInfoPlugin)
 .settings(libraryDependencies ++= Dependencies.serverDependencies)
 .dependsOn(sdk)
 .dependsOn(common)
 .dependsOn(core)
 .dependsOn(core % "compile->compile;test->test")
 .settings(
   test in assembly := {},
   assemblyJarName in assembly := "server-assembly.jar",
   mainClass in assembly := Some("com.opticdev.server.http.Lifecycle"),
   mainClass in packageBin := Some("com.opticdev.server.http.Lifecycle")
 )
  .enablePlugins(AssemblyPlugin)

concurrentRestrictions in Global += Tags.limit(Tags.Test, 1)