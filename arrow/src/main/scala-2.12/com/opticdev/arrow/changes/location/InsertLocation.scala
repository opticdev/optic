package com.opticdev.arrow.changes.location

import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.parsers.ParserBase
import com.opticdev.parsers.graph.AstPrimitiveNode
import com.opticdev.sdk.descriptions.Container
import com.opticdev.core.sourcegear.graph.GraphImplicits._
import scala.util.Try

sealed trait InsertLocation {
  def resolveToLocation(sourceGear: SourceGear) : Try[ResolvedLocation]
}

case class AsChildOf(file: File, position: Int) extends InsertLocation {
  override def resolveToLocation(sourceGear: SourceGear) = Try {
    val parsed = sourceGear.parseFile(file)(null)
    val graph = parsed.get.astGraph
    val parser = parsed.get.parser

    val blockTypes = parser.blockNodeTypes

    val possibleParents = graph.nodes.toVector.collect {
      case n if n.value.isAstNode() &&
        blockTypes.contains(n.value.asInstanceOf[AstPrimitiveNode].nodeType) &&
        n.value.asInstanceOf[AstPrimitiveNode].range
          .contains(position) => n.value.asInstanceOf[AstPrimitiveNode]
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

    ResolvedChildInsertLocation(insertionIndex, actualParent, parser)
  }
}

case class RawPosition(file: File, position: Int) extends InsertLocation {
  override def resolveToLocation(sourceGear: SourceGear) = Try {
    val parsed = sourceGear.parseFile(file)(null)
    val parser = parsed.get.parser
    ResolvedRawLocation(position, parser)
  }
}
//case class InContainer(container: AstPrimitiveNode, atIndex: RelativeIndex = Last) extends InsertLocation


/* Resolved Location */
sealed trait ResolvedLocation {
  val parser : ParserBase
}
case class ResolvedRawLocation(rawPosition: Int, parser : ParserBase) extends ResolvedLocation
case class ResolvedChildInsertLocation(index: Int, parent: AstPrimitiveNode, parser : ParserBase) extends ResolvedLocation
