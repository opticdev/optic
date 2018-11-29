package com.opticdev.core.sourcegear.accumulate

import com.opticdev.common.SchemaRef
import com.opticdev.core.compiler.helpers.FinderPath
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.gears.helpers.ModelField
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, LinkedModelNode, ModelNode, NoMapping}
import com.opticdev.marvin.runtime.mutators.array.AstMapping
import com.opticdev.core.sourcegear.graph.GraphImplicits._
import com.opticdev.common.graph.{AstGraph, CommonAstNode}
import com.opticdev.common.graph.path.{FlatWalkablePath, WalkablePath}
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.parsers.token_values.{External, Imported}
import com.opticdev.sdk.skills_sdk.LensRef
import com.opticdev.sdk.skills_sdk.lens.{OMComponentWithPropertyPath, OMLensAssignmentComponent}
import play.api.libs.json.JsString

import scala.util.Try

//@todo it's likely that multiple listeners will be created -- eventually combine them to reduce # of lookups.
case class AssignmentListener(assignmentComponent: OMComponentWithPropertyPath[OMLensAssignmentComponent], walkablePath: Option[FlatWalkablePath], mapToSchema: SchemaRef, lensRef: LensRef) extends Listener {

  override val schema: Option[SchemaRef] = None

  override def collect(implicit astGraph: AstGraph, modelNode: BaseModelNode, sourceGearContext: SGContext): Option[ModelField] = {
    val component = assignmentComponent.component

    val asModelNode : ModelNode = modelNode match {
      case l: LinkedModelNode[CommonAstNode] => l.flatten
      case mN: ModelNode => mN
    }

    val astRoot = asModelNode.astRoot()

    //from a token with a path
    if (component.fromToken && walkablePath.isDefined) Try {
      val variableNode = WalkablePath(astRoot, walkablePath.get.path, astGraph).walk()

      val entryOption = {
        val nodeIdentifier = sourceGearContext.parser.identifierNodeDesc.parse(variableNode)
        sourceGearContext.fileTokenRegistry.getExpanded(nodeIdentifier.get)
      }

      if (entryOption.isDefined) {

        val (inScope, value) = entryOption.get match {
          case imported: Imported[SGContext] => {
            (true, imported.model.asInstanceOf[ModelNode].expandedValue()(imported.context))
          }
          case local => {
            val rootNode = local.model.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](astGraph).root
            val inScope = local.inScope(astRoot, rootNode, astGraph, sourceGearContext.parser)
            val value = local.model.asInstanceOf[ModelNode].expandedValue()(sourceGearContext)
            (inScope, value)
          }
        }

        if (inScope) {
          val tokenValue = {
            import com.opticdev.core.utils.GetKeyFromJsValue._
            value.walk(component.keyPath)
          }.get

          return Some(ModelField(
            component.keyPath.split("\\."),
            tokenValue,
            operation = component.operation
          ))

        } else return None
      } else {
        //not tied to a specific token (like collect)
        None
      }
    }

    None
  }
}
