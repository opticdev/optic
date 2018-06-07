package com.opticdev.core.sourcegear

import com.opticdev.arrow.state.NodeKeyStore
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, LinkedModelNode, ModelNode}
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.marvin.common.ast.NewAstNode
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.sdk.descriptions.transformation.mutate.{MutationOptions, StagedMutation, StagedTagMutation}
import com.opticdev.core.sourcegear.mutate.MutationImplicits._
import com.opticdev.core.sourcegear.variables.VariableChanges
import com.opticdev.core.utils.StringUtils
import com.opticdev.marvin.common.helpers.InRangeImplicits._

import scala.util.Try
import com.opticdev.core.utils.StringUtils._

object Mutate {

  def fromStagedMutation(stagedMutation: StagedMutation)(implicit sourceGearContext: SGContext, project: OpticProject, nodeKeyStore: NodeKeyStore) : Try[(NewAstNode, String, CommonAstNode)] = Try {
    val modelNodeOption = resolveNode(stagedMutation.modelId)
    require(modelNodeOption.isDefined, s"No model found with id ${stagedMutation.modelId}")

    val modelNode = modelNodeOption.get

    def reparse(string: String): (LinkedModelNode[CommonAstNode], String, SGContext) = {
      val parsed = sourceGearContext.sourceGear.parseString(string, sourceGearContext.file).get
      import com.opticdev.core.sourcegear.graph.GraphImplicits._
      val programNode = parsed.astGraph.root.get

      val newModelNode = parsed.astGraph.nodes.collect {
        case n if n.value.isInstanceOf[BaseModelNode] &&
          n.value.asInstanceOf[BaseModelNode].schemaId == modelNode.schemaId &&
          programNode.hasChild(n.value.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](parsed.astGraph).root)(parsed.astGraph) =>
          n.value.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](parsed.astGraph)
      }.minBy(_.root.graphDepth(parsed.astGraph))

      (newModelNode, string, SGContext.forRender(sourceGearContext.sourceGear, parsed.astGraph, parsed.parser.parserRef))
    }


    var (cModel, cRaw, cSGContext, cFileContents) = (
      modelNode,
      sourceGearContext.fileContents.substring(Range(modelNode.root.range.start, modelNode.root.range.end)),
      sourceGearContext,
      sourceGearContext.fileContents)

    val tagsOption = stagedMutation.options.flatMap(_.tags).foreach(tagMutations=> {
      tagMutations.foreach {
        case (tag, mutation) => {
          mutateTag(cModel.root, mutation)(cSGContext, project, nodeKeyStore)
            .foreach(result => {
              val updated = StringUtils.replaceRange(cRaw, cModel.root.range, result._2)
              val oldCModelRange = cModel.root.range
              val newFileContents = StringUtils.replaceRange(cFileContents, result._3.range, updated)
              val r = reparse(newFileContents)
              cModel = r._1
              cRaw = newFileContents.substring(cModel.root.range.start, cModel.root.range.end)
              cFileContents = newFileContents
              cSGContext = r._3.copy(fileContents = cFileContents)
            })
        }
      }
    })

    val containersOptions = stagedMutation.options.flatMap(_.containers)

    val variablesOption = stagedMutation.options.flatMap(_.variables).map(variable=> {
      VariableChanges.fromVariableMapping(variable, sourceGearContext.parser)
    })

    val modelRange = cModel.root.range
    val updated = cModel.update(stagedMutation.value.getOrElse(modelNode.expandedValue()), variablesOption)(cSGContext, cFileContents)

    val trimmed = updated.substring(modelRange.start, modelRange.end + (updated.length - cFileContents.length))

    (NewAstNode(cModel.root.nodeType.name, null, Some(trimmed)), trimmed, cModel.root)
  }

  //steps
  def resolveNode(modelId: String)(implicit nodeKeyStore: NodeKeyStore) =
    nodeKeyStore.lookupId(modelId)

  def mutateTag(parent: CommonAstNode, stagedTagMutation: StagedTagMutation)(implicit sourceGearContext: SGContext, project: OpticProject, nodeKeyStore: NodeKeyStore) = {
    implicit val astGraph = sourceGearContext.astGraph
    import com.opticdev.core.sourcegear.graph.GraphImplicits.CommonAstNodeInstance

    val modelNode = sourceGearContext.astGraph.nodes.collectFirst {
      case n if n.value.isInstanceOf[BaseModelNode] &&
                n.value.asInstanceOf[BaseModelNode].tag.exists(_.tag == stagedTagMutation.tag) &&
                parent.hasChild(n.value.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](astGraph).root) =>
        n.value.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](astGraph)
    }

    require(modelNode.isDefined, s"Tag ${stagedTagMutation.tag} not found")
    val modelId = nodeKeyStore.leaseId(sourceGearContext.file, modelNode.get)
    val stagedMutation = stagedTagMutation.toStagedMutation(modelId)

    Mutate.fromStagedMutation(stagedMutation)
  }

}
