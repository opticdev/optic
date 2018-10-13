package com.opticdev.cli

import better.files.File
import com.opticdev.cli.commands.{DumpGraph, Publish, StartServer}
import com.opticdev.common.BuildInfo

object Cli extends App  {

  case class Config(mode: String = null, bashScript: Option[String] = None)

  val parser = new scopt.OptionParser[Config]("optic") {
    head("optic", BuildInfo.currentOpticVersion)

    cmd("publish").action( (_, c) => c.copy(mode = "publish") ).
      text("publishes the current project graph")

    cmd("startserver").action( (_, c) => c.copy(mode = "startserver") ).
      text("starts a headless optic server on port 30333")

    cmd("dumpgraph").action( (_, c) => c.copy(mode = "dumpgraph") ).
      text("dumps the project graph for the optic project in pwd").
      children(
        arg[String]("<processor script>...").unbounded().optional().action( (x, c) =>
          c.copy(bashScript = Some(x)) ).text("(optional) bash script to process graph. JSON of Graph will be first arg. ie 'node dosomething.js'")
      )

  }

  // parser.parse returns Option[C]
  val argsSeq = args.toSeq
  System.setProperty("opticmdbinary", args(0))

  val trimmedArgs = argsSeq.splitAt(1)._2

  parser.parse(trimmedArgs, Config()) match {
    case Some(config) =>
      config.mode match {
        case "publish" => Publish.publish(File(System.getProperty("user.dir")))
        case "startserver" => StartServer.start
        case "dumpgraph" => DumpGraph.run(File(System.getProperty("user.dir")), config.bashScript)
        case _ => println(parser.usage)
      }
    case None =>
    // arguments are bad, error message will have been displayed
  }

}
