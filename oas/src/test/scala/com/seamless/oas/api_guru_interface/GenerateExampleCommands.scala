package com.seamless.oas.api_guru_interface

import better.files.File
import com.seamless.oas.{OASResolver, Parser}
import com.seamless.oas.api_guru_interface.{All, AskFilter, AskTrait}
import com.seamless.oas.api_guru_interface.questions.ParseAttempt
import com.seamless.serialization.CommandSerialization

import scala.util.Try

object GenerateExampleCommands extends AskTrait[ParseAttempt, Unit] {
  override def question: String = "doing commands we need"

  val usedAsExample = Map(
    "stripe" -> "stripe.com.json",
    "aws" -> "amazonaws.com.json",
    "github" -> "github.com.json",
    "gitlab" -> "gitlab.com.json",
    "circleci" -> "circleci.com.json",
    "azure" -> "azure.local.json",
    "netlify" -> "netlify.com.json",
  )

  override def filter: AskFilter = All((a, b) => {
    usedAsExample.values.toSet.contains(a)
  })

  override def processAPI(resolver: OASResolver, apiName: String): ParseAttempt = {
    ParseAttempt(apiName, Try(Parser.parseOAS(resolver.root.toString())))
  }

  override def report(results: ParseAttempt*): Unit = {
    val outputDir = File("command-examples")
    outputDir.createIfNotExists(asDirectory = true)
    outputDir.list.foreach(_.delete(true))

    val swapped = usedAsExample.map(_.swap)

    results.foreach {
      case i if i.tryResult.isSuccess => {
        val jsonString = CommandSerialization.toJson(i.tryResult.get.commands).noSpaces
        val outputFile = outputDir / (swapped(i.apiName)+"-commands.json")
        outputFile.createIfNotExists()
        outputFile.write(jsonString)
      }
      case i => println(i.apiName)
    }
  }
}
