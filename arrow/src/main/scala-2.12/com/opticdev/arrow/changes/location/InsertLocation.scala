package com.opticdev.arrow.changes.location

import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.parsers.{AstGraph, ParserBase}
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.sdk.descriptions.Container
import com.opticdev.core.sourcegear.graph.GraphImplicits._
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor

import scala.util.Try

sealed trait InsertLocation {
  val file: File
  def resolveToLocation(sourceGear: SourceGear)(implicit filesStateMonitor: FileStateMonitor) : Try[ResolvedLocation]
}

case class AsChildOf(file: File, position: Int) extends InsertLocation {
  override def resolveToLocation(sourceGear: SourceGear)(implicit filesStateMonitor: FileStateMonitor) = Try {
    val fileContents = filesStateMonitor.contentsForFile(file).get
    val parsed = sourceGear.parseString(fileContents)(null)
    val graph = parsed.get.astGraph
    val parser = parsed.get.parser

    val blockTypes = parser.blockNodeTypes

    val possibleParents = graph.nodes.toVector.collect {
      case n if n.value.isAstNode() &&
        blockTypes.nodeTypes.contains(n.value.asInstanceOf[CommonAstNode].nodeType) &&
        n.value.asInstanceOf[CommonAstNode].range
          .contains(position) => n.value.asInstanceOf[CommonAstNode]
    }

    //we want the deepest block node that contains our desired insert location
    val actualParent = possibleParents.maxBy(_.graphDepth(graph))

    val children = actualParent.children(graph).map(_._2)
    //by counting all the children that come before we can determine the insertion index
    val insertionIndex = children.count((n)=> {
      n.range.end < position
    })

    if (children.exists(_.range.contains(position))) {
      throw new Exception("Insert position is within a sibling node")
    }

    ResolvedChildInsertLocation(insertionIndex, actualParent, graph, parser)
  }
}

case class RawPosition(file: File, position: Int) extends InsertLocation {
  override def resolveToLocation(sourceGear: SourceGear)(implicit filesStateMonitor: FileStateMonitor) = Try {
    val fileContents = filesStateMonitor.contentsForFile(file).get
    val parsed = sourceGear.parseString(fileContents)(null)
    val parser = parsed.get.parser
    ResolvedRawLocation(position, parser)
  }
}

//case class InContainer(container: CommonAstNode, atIndex: RelativeIndex = Last) extends InsertLocation

/* Resolved Location */
sealed trait ResolvedLocation {
  val parser : ParserBase
}
case class ResolvedRawLocation(rawPosition: Int, parser : ParserBase) extends ResolvedLocation
case class ResolvedChildInsertLocation(index: Int, parent: CommonAstNode, graph: AstGraph, parser : ParserBase) extends ResolvedLocation
