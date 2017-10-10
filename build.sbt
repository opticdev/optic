name := "optic-core"

organization := "com.opticdev"

version := "1.0"

scalaVersion := "2.12.3"

libraryDependencies ++= Dependencies.mainDependencies


enablePlugins(JavaAppPackaging)
assemblyJarName in assembly := "optic.jar"
test in assembly := {}
mainClass in assembly := Some("com.opticdev.server.http.Lifecycle")