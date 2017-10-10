logLevel := Level.Warn

resolvers += Resolver.sonatypeRepo("releases")

addSbtPlugin("com.lucidchart" % "sbt-cross" % "3.0")
addSbtPlugin("org.scoverage" % "sbt-scoverage" % "1.5.1")