package com.useoptic.serialization

import com.useoptic.contexts.requests.Commands.RequestsCommand
import com.useoptic.contexts.rfc.Commands.{ContributionCommand, RfcCommand, VersionControlCommand}
import com.useoptic.contexts.shapes.Commands.ShapesCommand
import com.useoptic.logging.Logger
import io.circe.Decoder.Result
import io.circe._
import io.circe.generic.auto._
import io.circe.syntax._

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}
import scala.util.{Failure, Try}

object CommandSerialization {
  def toJson(commands: Seq[RfcCommand]): Json = {
    commands.map(x => toJson(x)).asJson
  }
  def toJson(command: RfcCommand): Json = {
    command match {
      case shapesCommand: ShapesCommand => shapesCommand.asJson
      case requestCommand: RequestsCommand => requestCommand.asJson
      case contributionCommand: ContributionCommand => contributionCommand.asJson
      case versionControlCommand: VersionControlCommand => versionControlCommand.asJson
      case _ => throw new java.lang.Error("Unhandled command Type")
    }
  }

  def toJsonString(command: RfcCommand): String = {
    command match {
      case shapesCommand: ShapesCommand => shapesCommand.asJson.noSpaces
      case requestCommand: RequestsCommand => requestCommand.asJson.noSpaces
      case contributionCommand: ContributionCommand => contributionCommand.asJson.noSpaces
      case versionControlCommand: VersionControlCommand => versionControlCommand.asJson.noSpaces
      case _ => throw new java.lang.Error("Unhandled command Type")
    }
  }

  private def decodeShapesCommand(item: Json): Result[ShapesCommand] = item.as[ShapesCommand]

  private def decodeRequestCommand(item: Json): Result[RequestsCommand] = item.as[RequestsCommand]

  private def decodeRfcCommand(item: Json): Result[ContributionCommand] = item.as[ContributionCommand]

  def fromJson(json: Json): Try[Vector[RfcCommand]] = Try {
    if (!json.isArray) {
      return Failure(new Exception("not an array"))
    }
    val parseResults = json.asArray.get.map {
      case i => TryChainUtil.firstSuccessIn(i,
        (j: Json) => Try(decodeShapesCommand(j).right.get),
        (j: Json) => Try(decodeRequestCommand(j).right.get),
        (j: Json) => Try(decodeRfcCommand(j).right.get),
        (j: Json) => {
          Try(j.as[ContributionCommand].right.get)
        },
        (j: Json) => {
          Try(j.as[VersionControlCommand].right.get)
        }
      )
    }
    require(parseResults.forall(_.isDefined), "Some commands could not be decoded")
    parseResults.collect { case i if i.isDefined => i.get }
  }

  def fromJsonString(jsonString: String) = {
    import io.circe.parser._

    val commandsVector =
      for {
        json <- Try(parse(jsonString).right.get)
        commandsVector <- CommandSerialization.fromJson(json)
      } yield commandsVector
    if (commandsVector.isFailure) {
      Logger.log(commandsVector.failed.get)
    }
    require(commandsVector.isSuccess, "failed to parse and handle commands")
    commandsVector.get
  }
}
