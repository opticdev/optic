package com.opticdev.cli

import better.files.File
import com.opticdev.cli.commands.Publish

object Cli {

  case class Config(mode: String = null)

  val parser = new scopt.OptionParser[Config]("optic") {
    head("optic", "3.x")

    cmd("publish").action( (_, c) => c.copy(mode = "publish") ).
      text("publishes the current project graph")
  }

  def main(args: Array[String]): Unit = {
    // parser.parse returns Option[C]
    parser.parse(args, Config()) match {
      case Some(config) =>
        if (config.mode == "publish") {
          Publish.publish(File(System.getProperty("user.dir")))
        }
      case None =>
      // arguments are bad, error message will have been displayed
    }
  }

}
