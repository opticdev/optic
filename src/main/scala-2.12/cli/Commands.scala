package cli

import java.io.File

import scala.util.Try
/**
  * Created by aidancunniffe on 8/9/17.
  */
trait CliCommands {
  def execute : Try[String]
}

case class Compile(in: File, out: File) extends CliCommands {
  override def execute : Try[String] = ???
}