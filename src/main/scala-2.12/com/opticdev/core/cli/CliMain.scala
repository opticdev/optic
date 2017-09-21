package com.opticdev.core.cli

import java.io.File

//object CliMain {
//
//  case class Config(
//                     //update command
//                     in: File = new File("."),
//                     out: File = new File("."),
//
//                     //config
//                     mode: String = "")
//
//  val parser = new scopt.OptionParser[Config]("optic") {
//    head("optic", "1.0")
//
//    help("help").text("prints this usage text")
//    version("version").text("prints the current version")
//
//    cmd("compile").action( (_, c) => c.copy(mode = "compile") ).
//      text("compiles JS files built with the optic-sdk").
//      children(
//        arg[File]("<file>...").optional().valueName("<dir>")
//          .action( (x, c) =>
//          c.copy(in = x) ).text("directory to be compiled"),
//        opt[File]('o', "out").required().valueName("<file>").
//          action( (x, c) => c.copy(out = x) ).
//          text("output file to write. combines")
//      )
//  }
//
//  def main(args: Array[String]): Unit = {
//    parser.parse(args, Config())  match {
//      case Some(config) =>
//
//      case None =>
//
//      // arguments are bad, error message will have been displayed
//    }
//  }
//
//  def configToCommand(config: Config): CliCommands = config.mode match {
//      case "compile" => Compile(config.in, config.out)
//  }
//}
