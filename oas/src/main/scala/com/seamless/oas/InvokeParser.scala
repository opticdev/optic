package com.seamless.oas

import com.seamless.oas.InvokeParser.pathToContents
import com.seamless.serialization.CommandSerialization
import play.api.libs.json.{JsObject, JsString}
object InvokeParser {

  def pathToContents(file: String): String = {
    val loaded = scala.io.Source.fromFile(file)
    val source = loaded.getLines mkString "\n"
    loaded.close()
    source
  }

  def main(args: Array[String]): Unit = {
    val parserResult = Parser.parseOAS(pathToContents("src/test/resources/api-guru/flat/github.com.json"))
    println(parserResult.commands.size)
    println(CommandSerialization.toJson(parserResult.commands).noSpaces)
  }

}
