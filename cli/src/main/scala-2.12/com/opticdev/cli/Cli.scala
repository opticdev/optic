package com.opticdev.cli

import better.files.File
import com.opticdev.cli.commands.{DumpGraph, Publish}

object Cli {

  System.setProperty("opticmdbinary", "/Users/aidancunniffe/Developer/knack/optic-core/server/src/main/resources/opticmarkdown")

  case class Config(mode: String = null, bashScript: Option[String] = None)

  val parser = new scopt.OptionParser[Config]("optic") {
    head("optic", "3.x")

    cmd("publish").action( (_, c) => c.copy(mode = "publish") ).
      text("publishes the current project graph")

    cmd("dumpgraph").action( (_, c) => c.copy(mode = "dumpgraph") ).
      text("dumps the project graph for the optic project in pwd").
      children(
        arg[String]("<processor script>...").unbounded().optional().action( (x, c) =>
          c.copy(bashScript = Some(x)) ).text("(optional) bash script to process graph. will be first arg. ie 'node dosomething.js'")
      )

  }

  def main(args: Array[String]): Unit = {
    // parser.parse returns Option[C]
    parser.parse(args, Config()) match {
      case Some(config) =>
        config.mode match {
          case "publish" => Publish.publish(File(System.getProperty("user.dir")))
          case "dumpgraph" => DumpGraph.run(File(System.getProperty("user.dir")), config.bashScript)
        }
      case None =>
      // arguments are bad, error message will have been displayed
    }
  }

}
