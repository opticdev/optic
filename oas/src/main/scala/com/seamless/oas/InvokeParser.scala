package com.seamless.oas

import com.seamless.serialization.CommandSerialization

object InvokeParser {

  def pathToContents(file: String): String = {
    val loaded = scala.io.Source.fromFile(file)
    val source = loaded.getLines mkString "\n"
    loaded.close()
    source
  }

  def main(args: Array[String]): Unit = {
    val parserResult = Parser.parseOAS(pathToContents("src/test/resources/mattermost-2.json"))
    println(parserResult.commands.size)
    println(CommandSerialization.toJson(parserResult.commands).noSpaces)
  }

}
