package com.opticdev.arrow.changes.evaluation

import better.files.File
import com.opticdev.arrow.changes.location.{ResolvedChildInsertLocation, ResolvedLocation, ResolvedRawLocation}
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor
import com.opticdev.core.utils.StringUtils
import com.opticdev.marvin.common.ast._
import com.opticdev.marvin.common.ast.OpticGraphConverter._
import com.opticdev.marvin.common.helpers.LineOperations
import com.opticdev.marvin.runtime.mutators.MutatorImplicits._
import com.opticdev.marvin.runtime.mutators.NodeMutatorMap
import play.api.libs.json.JsString

import scala.util.{Failure, Success, Try}

object InsertCode {

  def atLocation(generatedNode: (NewAstNode, String), file: File, resolvedLocation: ResolvedLocation)(implicit filesStateMonitor : FileStateMonitor): ChangeResult = Try {
    val fileContents = filesStateMonitor.contentsForFile(file).get
    resolvedLocation match {
      case loc : ResolvedRawLocation => {
        val changed = StringUtils.insertAtIndex(fileContents, loc.rawPosition, generatedNode._2)
        FileChanged(file, changed)

      }
      case loc : ResolvedChildInsertLocation => {

        val marvinAstParent = loc.parent.toMarvinAstNode(loc.graph, fileContents, loc.parser)

        val childrenIndent = marvinAstParent.indent.next

        val gcWithLeadingWhiteSpace = LineOperations.padAllLinesWith(childrenIndent.generate, generatedNode._2)

        implicit val nodeMutatorMap = loc.parser.marvinSourceInterface.asInstanceOf[NodeMutatorMap]

        val blockPropertyPath = loc.parser.blockNodeTypes.getPropertyPath(loc.parent.nodeType).get

        val array = marvinAstParent.properties(blockPropertyPath).asInstanceOf[AstArray]

        val newNode = NewAstNode(
          generatedNode._1.nodeType,
          generatedNode._1.properties,
          //overriding with our own string.
          Some(gcWithLeadingWhiteSpace))

        val newArray = array.children.patch(loc.index, Seq(newNode), 0)

        val newProperties: AstProperties = marvinAstParent.properties + (blockPropertyPath -> AstArray(newArray:_*))

        val changes = marvinAstParent.mutator.applyChanges(marvinAstParent, newProperties)

        val updatedFileContents = StringUtils.replaceRange(fileContents, loc.parent.range, changes)

        FileChanged(file, updatedFileContents)

      }
    }
  } match {
    case Success(fileChanged) => fileChanged
    case Failure(e) => {
      e.printStackTrace()
      FailedToChange(e)
    }
  }

}
