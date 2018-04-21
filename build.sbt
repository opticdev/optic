import sbtbuildinfo.BuildInfoPlugin.autoImport.buildInfoPackage

import scala.io.Source
import scala.util.Try

name := "optic-core"

organization := "com.opticdev"

val appVersion = "0.1.5"

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
     "opticMDVersion" -> Constants.opticMDVersion
   ),
   buildInfoPackage := "com.opticdev.common"
 )

lazy val sdk = (project in file("sdk")).
  enablePlugins(BuildInfoPlugin).
  settings(commonSettings: _*)
  .settings(
    libraryDependencies ++= Dependencies.sdkDependencies,
    buildInfoKeys := Seq[BuildInfoKey](
      "opticMDTar" -> Constants.opticMDTar,
      "opticMDTarSum" -> Constants.opticMDTarSum,
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

lazy val core = (project in file("core")).
  settings(commonSettings: _*)
  .settings(libraryDependencies ++= Dependencies.coreDependencies)
  .dependsOn(common)
  .dependsOn(sdk)
  .dependsOn(opm)
  .dependsOn(opm % "compile->compile;test->test")

lazy val arrow = (project in file("arrow")).
  settings(commonSettings: _*)
  .settings(libraryDependencies ++= Dependencies.arrowDependencies)
  .dependsOn(core)
  .dependsOn(core % "compile->compile;test->test")
  .dependsOn(opm % "compile->compile;test->test")
  .dependsOn(sdk)

lazy val server = (project in file("server")).
 settings(commonSettings: _*)
 .enablePlugins(BuildInfoPlugin)
 .settings(libraryDependencies ++= Dependencies.serverDependencies)
 .dependsOn(sdk)
 .dependsOn(common)
 .dependsOn(core)
 .dependsOn(arrow)
 .dependsOn(core % "compile->compile;test->test")
 .dependsOn(arrow % "compile->compile;test->test")
 .settings(
   test in assembly := {},
   assemblyJarName in assembly := "server-assembly.jar",
   mainClass in assembly := Some("com.opticdev.server.http.Lifecycle"),
   mainClass in packageBin := Some("com.opticdev.server.http.Lifecycle"),
   buildInfoKeys := Seq[BuildInfoKey](
     "mixpanelToken" -> Constants.mixpanelToken
   ),
   buildInfoPackage := "com.opticdev.server"
 )
  .enablePlugins(AssemblyPlugin)

concurrentRestrictions in Global += Tags.limit(Tags.Test, 1)