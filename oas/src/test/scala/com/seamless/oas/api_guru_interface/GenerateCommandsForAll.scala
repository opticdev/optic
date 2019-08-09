package com.seamless.oas.api_guru_interface

import better.files.File
import com.seamless.oas.{OASResolver, Parser}
import com.seamless.oas.api_guru_interface.questions.{ParseAttempt, TotalResult}
import com.seamless.serialization.CommandSerialization

import scala.util.Try

object GenerateCommandsForAll extends AskTrait[ParseAttempt, Unit] {
  override def question: String = "[hijaked for other use] we're printing all the commands"

  val filterOut = Seq("gamesparks.net.json")

  override def filter: AskFilter = All((a, b) => !filterOut.contains(a))

  override def processAPI(resolver: OASResolver, apiName: String): ParseAttempt = {
    ParseAttempt(apiName, Try(Parser.parseOAS(resolver.root.toString())))
  }

  override def report(results: ParseAttempt*): Unit = {
    val outputDir = File("command-examples")
    outputDir.createIfNotExists(asDirectory = true)
    outputDir.list.foreach(_.delete(true))

    results.foreach {
      case i if i.tryResult.isSuccess => {
        val jsonString = CommandSerialization.toJson(i.tryResult.get.commands).noSpaces

        val outputFile = outputDir / (i.apiName+"-commands.json")
        outputFile.createIfNotExists()
        outputFile.write(jsonString)
      }
      case i => println(i.apiName)
    }
  }

}
