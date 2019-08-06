addSbtPlugin("org.scala-js" % "sbt-scalajs" % "0.6.28")

addCompilerPlugin(
  "org.scalamacros" % "paradise" % "2.1.1" cross CrossVersion.full
)