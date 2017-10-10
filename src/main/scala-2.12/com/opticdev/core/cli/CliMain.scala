package com.opticdev.core.cli

import better.files.File
import com.opticdev.core.cli.output.InstallSessionMonitor
import com.opticdev.launcher.ServiceLauncher
import me.tongfei.progressbar.ProgressBar
import scopt.OptionParser
object CliMain {
    case class Config(
                       in: java.io.File = new java.io.File("."),
                       //config
                       mode: String = "")

    val parser = new scopt.OptionParser[Config]("optic") {
      head("optic", "1.0")

      help("help").text("prints this usage text")
      version("version").text("prints the current version")
      cmd("server-start").action( (_, c) => c.copy(mode = "server-start") ).
        text("starts an Optic Server")
      cmd("install").action( (_, c) => c.copy(mode = "install") ).
        text("compiles and installs an Optic SDK Description").
        children(
          arg[java.io.File]("<file>...").required().valueName("<file>")
            .action( (x, c) =>
            c.copy(in = x) ).text("SDK description file")
        )

      cmd("install-parser").action( (_, c) => c.copy(mode = "install-parser") ).
        text("installs a parser").
        children(
          arg[java.io.File]("<file>...").required().valueName("<file>")
            .action( (x, c) =>
              c.copy(in = x) ).text("parser jar")
        )
    }


    def main(args: Array[String]): Unit = {
      implicit val logToCli = true
      handle (parser.parse(args, Config()))
    }

    def handleArgs(args: Array[String]) (implicit logToCli: Boolean = false): Any = handle (parser.parse(args, Config()))

    def handle(configOption: Option[Config]) (implicit logToCli: Boolean = false): Any = configOption match {
      case Some(config) =>
        config.mode match {
          case "install" => {
            Installer.installDescription(File(config.in.getAbsolutePath))
          }
          case "install-parser" => {
            Installer.installParser(File(config.in.getAbsolutePath))
          }
          case "server-start" => {
            ServiceLauncher.startOpticServer
          }
        }
      case None => "error"

    }
}
