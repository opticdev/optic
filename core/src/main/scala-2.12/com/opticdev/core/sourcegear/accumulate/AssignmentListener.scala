package com.opticdev.core.sourcegear.accumulate

import com.opticdev.common.SchemaRef
import com.opticdev.core.compiler.helpers.FinderPath
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.gears.helpers.ModelField
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, LinkedModelNode, ModelNode, NoMapping}
import com.opticdev.marvin.runtime.mutators.array.AstMapping
import com.opticdev.parsers.AstGraph
import com.opticdev.core.sourcegear.graph.GraphImplicits._
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.parsers.graph.path.{FlatWalkablePath, WalkablePath}
import com.opticdev.parsers.tokenvalues.External
import com.opticdev.sdk.skills_sdk.lens.{OMComponentWithPropertyPath, OMLensAssignmentComponent}
import play.api.libs.json.JsString

import scala.util.Try

case class AssignmentListener(assignmentComponent: OMComponentWithPropertyPath[OMLensAssignmentComponent], walkablePath: Option[FlatWalkablePath], mapToSchema: SchemaRef, packageId: String) extends Listener {

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
        sourceGearContext.fileTokenRegistry.get(nodeIdentifier.get)
      }

      if (entryOption.isDefined) {
        val rootNode = entryOption.get.model.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](astGraph).root
        if (entryOption.get.inScope(astRoot, rootNode, astGraph)) { // in scope

          val tokenValue = {
            val value = entryOption.get.model.asInstanceOf[ModelNode].expandedValue()(sourceGearContext)
            import com.opticdev.core.utils.GetKeyFromJsValue._
            value.walk(component.keyPath)
          }.get

          return Some(ModelField(
            component.keyPath.split("\\."),
            tokenValue,
            operation = component.operation
          ))

        } else return None
      } else return None
    }

    None
  }
}
