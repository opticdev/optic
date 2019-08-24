package com.seamless.serialization

import com.seamless.contexts.requests.Commands.RequestsCommand
import com.seamless.contexts.rfc.Commands.{ContributionCommand, RfcCommand}
import com.seamless.contexts.shapes.Commands.ShapesCommand
import io.circe.Decoder.Result
import io.circe._
import io.circe.generic.auto._
import io.circe.syntax._

import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}
import scala.util.Try

@JSExportTopLevel("CommandSerialization")
@JSExportAll
object CommandSerialization {
  def toJson(vector: Seq[RfcCommand]): Json = {
    vector.map {
      case shapesCommand: ShapesCommand => shapesCommand.asJson
      case requestCommand: RequestsCommand => requestCommand.asJson
      case contributionCommand: ContributionCommand => contributionCommand.asJson
      case _ => throw new java.lang.Error("Unhandled command Type")
    }.asJson
  }

  def toJsonString(command: RfcCommand): String = {
    command match {
      case shapesCommand: ShapesCommand => shapesCommand.asJson.noSpaces
      case requestCommand: RequestsCommand => requestCommand.asJson.noSpaces
      case contributionCommand: ContributionCommand => contributionCommand.asJson.noSpaces
      case _ => throw new java.lang.Error("Unhandled command Type")
    }
  }


  private def decodeShapesCommand(item: Json): Result[ShapesCommand] = item.as[ShapesCommand]

  private def decodeRequestCommand(item: Json): Result[RequestsCommand] = item.as[RequestsCommand]

  private def decodeRfcCommand(item: Json): Result[ContributionCommand] = item.as[ContributionCommand]

  def fromJson(json: Json): Try[Vector[RfcCommand]] = Try {
    val parseResults = json.asArray.get.map {
      case i => TryChainUtil.firstSuccessIn(i,
        (j: Json) => Try(decodeShapesCommand(j).right.get),
        (j: Json) => Try(decodeRequestCommand(j).right.get),
        (j: Json) => Try(decodeRfcCommand(j).right.get),
        (j: Json) => {
          println(j)
          Try(j.as[ContributionCommand].right.get)
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
      println(commandsVector.failed.get)
    }
    require(commandsVector.isSuccess, "failed to parse and handle commands")
    commandsVector
  }
}
