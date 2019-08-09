addSbtPlugin("org.scala-js" % "sbt-scalajs" % "0.6.27")

addCompilerPlugin(
  "org.scalamacros" % "paradise" % "2.1.1" cross CrossVersion.full
)