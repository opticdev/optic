addSbtPlugin("org.portable-scala" % "sbt-scalajs-crossproject"      % "0.6.1")
addSbtPlugin("org.portable-scala" % "sbt-scala-native-crossproject" % "0.6.1")
addSbtPlugin("org.scala-native"   % "sbt-scala-native"              % "0.3.7")

addSbtPlugin("org.scala-js" % "sbt-scalajs" % "0.6.32")

addCompilerPlugin(
  "org.scalamacros" % "paradise" % "2.1.1" cross CrossVersion.full
)
