package com.useoptic.diff

import com.useoptic.contexts.requests.Commands
import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.shapes.Commands.{AddShape, RenameShape}

import scala.scalajs.js.annotation.{JSExport, JSExportAll}
import scala.scalajs.js
import scala.scalajs.js.Dictionary

@JSExport
@JSExportAll
object NaiveSummary {

  def fromCommands(commands: Seq[RfcCommand]): Dictionary[Int] = {

    val pathsInNewOps = commands.map {
      case Commands.AddRequest(_, pathId, _) => pathId
      case _ =>
    }.toSet

    val newPaths = commands.count {
      case Commands.AddPathComponent(pathId, _, _) => pathsInNewOps.contains(pathId)
      case Commands.AddPathParameter(pathId, _, _) => pathsInNewOps.contains(pathId)
      case _ => false
    }

    val newOperations = commands.count {
      case Commands.AddRequest(_, _, _) => true
      case _ => false
    }

    val newResponses = commands.count {
      case Commands.AddResponse(_, _, _) => true
      case _ => false
    }

    val newConcepts = commands.count {
      case AddShape(_, _, name) => name.nonEmpty
      case RenameShape(shapeId, name) => name.nonEmpty && commands.exists {
        case AddShape(_shapeId, _, _) => _shapeId == shapeId
        case _ => false
      }
      case _ => false
    }

    import js.JSConverters._

    Map(
      "New Paths" -> newPaths,
      "New Operations" -> newOperations,
      "New Responses" -> newResponses,
      "New Concepts" -> newConcepts,
    ).toJSDictionary

  }
}
