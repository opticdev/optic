addSbtPlugin("com.thesamet" % "sbt-protoc" % "0.99.28" exclude ("com.thesamet.scalapb", "protoc-bridge_2.12"))
libraryDependencies += "com.thesamet.scalapb" %% "compilerplugin-shaded" % "0.9.6"
