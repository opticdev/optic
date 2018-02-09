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

  def atLocation(generatedCode: String, file: File, resolvedLocation: ResolvedLocation)(implicit filesStateMonitor : FileStateMonitor): ChangeResult = Try {
    val fileContents = filesStateMonitor.contentsForFile(file).get
    resolvedLocation match {
      case loc : ResolvedRawLocation => {
        val changed = StringUtils.insertAtIndex(fileContents, loc.rawPosition, generatedCode)
        FileChanged(file, changed)

      }
      case loc : ResolvedChildInsertLocation => {

        val marvinAstParent = loc.parent.toMarvinAstNode(loc.graph, fileContents, loc.parser)

        val childrenIndent = marvinAstParent.indent.next

        val gcWithLeadingWhiteSpace = LineOperations.padAllLinesWith(childrenIndent.generate, generatedCode)

        implicit val nodeMutatorMap = loc.parser.marvinSourceInterface.asInstanceOf[NodeMutatorMap]

        val array = marvinAstParent.properties("body").asInstanceOf[AstArray]

        val newArray = array.children :+
          NewAstNode(
          array.children.head.nodeType,
          array.children.head.properties + ("kind" -> AstString("const")),
          //overriding with our own string.
          Some(gcWithLeadingWhiteSpace))

        val newProperties: AstProperties = marvinAstParent.properties + ("body" -> AstArray(newArray:_*))

        val changes = marvinAstParent.mutator.applyChanges(marvinAstParent, newProperties)

        val updatedFileContents = StringUtils.replaceRange(fileContents, loc.parent.range, changes)

        FileChanged(file, updatedFileContents)

      }
    }
  } match {
    case Success(fileChanged) => fileChanged
    case Failure(e) => FailedToChange(e)
  }

}
