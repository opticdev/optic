package com.opticdev.core.sourcegear

import com.opticdev.arrow.state.NodeKeyStore
import com.opticdev.core.sourcegear.graph.model._
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.marvin.common.ast.NewAstNode
import com.opticdev.common.graph.{AstGraph, CommonAstNode}
import com.opticdev.sdk.descriptions.transformation.mutate._
import com.opticdev.core.sourcegear.mutate.MutationImplicits._
import com.opticdev.core.sourcegear.variables.VariableChanges
import com.opticdev.core.utils.StringUtils
import com.opticdev.marvin.common.helpers.InRangeImplicits._
import com.opticdev.marvin.common.ast._
import com.opticdev.marvin.common.ast.OpticGraphConverter._
import com.opticdev.marvin.runtime.mutators.MutatorImplicits._
import ContainerMutationOperationsEnum._
import com.opticdev.core.sourcegear.context.FlatContextBase

import scala.util.Try
import com.opticdev.core.utils.StringUtils._
import com.opticdev.marvin.runtime.mutators.NodeMutatorMap
import com.opticdev.parsers.SourceParserManager
import com.opticdev.sdk.descriptions.transformation.generate.StagedNode
import play.api.libs.json.JsObject

object Mutate {

  def fromStagedMutationWithoutSGContext(stagedMutation: StagedMutation)(implicit project: OpticProject, nodeKeyStore: NodeKeyStore, context: FlatContextBase = null): Try[(NewAstNode, String, scala.Range, ExpandedModelNode)] = {
    val modelNodeOption = resolveNode(stagedMutation.modelId)
    require(modelNodeOption.isDefined, s"No model found with id ${stagedMutation.modelId}")
    val modelNode = modelNodeOption.get
    implicit val sourceGearContext = modelNode.getContext()(project.actorCluster, project).get
    fromStagedMutation(stagedMutation)
  }

  def fromStagedMutation(stagedMutation: StagedMutation)(implicit sourceGearContext: SGContext, project: OpticProject, nodeKeyStore: NodeKeyStore, context: FlatContextBase = null) : Try[(NewAstNode, String, scala.Range, ExpandedModelNode)] = Try {
    val modelNodeOption = resolveNode(stagedMutation.modelId)
    require(modelNodeOption.isDefined && modelNodeOption.get.isInstanceOf[ExpandedModelNode], s"No model found with id ${stagedMutation.modelId}")

    val modelNode = modelNodeOption.get.asInstanceOf[ExpandedModelNode]

    def reparse(string: String): (ExpandedModelNode, String, SGContext) = {
      implicit val languageName = SourceParserManager.selectParserForFileName(sourceGearContext.file.name).get.languageName
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

    def tagParents(expandedModelNode: ExpandedModelNode, g: AstGraph) = expandedModelNode match {
      case mn: LinkedModelNode[CommonAstNode] => Seq(mn.root)
      case mmn: MultiModelNode => mmn.modelNodes.map(_.resolveInGraph[CommonAstNode](g).root)
    }

    var (cModel, cRaw, cSGContext, cFileContents) = (
      modelNode,
      sourceGearContext.fileContents.substring(modelNode.range(sourceGearContext.astGraph)),
      sourceGearContext,
      sourceGearContext.fileContents)

    val tagsOption = stagedMutation.options.flatMap(_.tags).foreach(tagMutations=> {
      tagMutations.foreach {
        case (tag, mutation) => {
          val oldCModelRange = cModel.range(sourceGearContext.astGraph)
          mutateTag(tagParents(cModel, cSGContext.astGraph), tag, mutation)(cSGContext, project, nodeKeyStore)
            .foreach(result => {
              val updated = StringUtils.replaceRange(cRaw, oldCModelRange, result._2)
              val newFileContents = StringUtils.replaceRange(cFileContents, result._3, updated)
              val r = reparse(newFileContents)
              cModel = r._1
              val newModelRange = cModel.range(r._3.astGraph)
              cRaw = newFileContents.substring(newModelRange)
              cFileContents = newFileContents
              cSGContext = r._3.copy(fileContents = cFileContents)
            })
        }
      }
    })

    val containersOptions = stagedMutation.options.flatMap(_.containers).foreach(containerMutations=> {
      containerMutations.foreach {
        case (containerName, mutation) => {
          mutateContainer(cModel, containerName, mutation)(cSGContext, project, nodeKeyStore, context).foreach(result => {
            val newFileContents = StringUtils.replaceRange(cFileContents, result._1, result._2)
            val newRaw = newFileContents.substring(result._1.start, result._1.start + result._2.length)
            val r = reparse(newFileContents)
            cModel = r._1
            cRaw = newRaw
            cFileContents = newFileContents
            cSGContext = r._3.copy(fileContents = cFileContents)
          })
        }
      }
    })

    val variablesOption = stagedMutation.options.flatMap(_.variables).map(variable=> {
      VariableChanges.fromVariableMapping(variable, sourceGearContext.parser)
    })

    val modelRange = cModel.range(cSGContext.astGraph)
    val updated = cModel.update(stagedMutation.value.getOrElse(JsObject.empty), variablesOption)(cSGContext, cFileContents)

    val trimmed = updated.substring(modelRange.start, modelRange.end + (updated.length - cFileContents.length))

    (NewAstNode(Try(cModel.asInstanceOf[LinkedModelNode[CommonAstNode]].root.nodeType.name).getOrElse("MultiWrapper"), null, Some(trimmed)), trimmed, modelRange, modelNode)
  }

  //steps
  def resolveNode(modelId: String)(implicit nodeKeyStore: NodeKeyStore): Option[ExpandedModelNode] =
    nodeKeyStore.lookupId(modelId)

  def mutateTag(parents: Seq[CommonAstNode], tag: String, stagedTagMutation: StagedTagMutation)(implicit sourceGearContext: SGContext, project: OpticProject, nodeKeyStore: NodeKeyStore) = {
    implicit val astGraph = sourceGearContext.astGraph
    import com.opticdev.core.sourcegear.graph.GraphImplicits.CommonAstNodeInstance

    val modelNode = sourceGearContext.astGraph.nodes.collectFirst {
      case n if n.value.isInstanceOf[BaseModelNode] &&
                n.value.asInstanceOf[BaseModelNode].tag.exists(_.tag == tag) &&
                parents.exists(parent=> parent.hasChild(n.value.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](astGraph).root)) =>
        n.value.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](astGraph)
    }

    import com.opticdev.core.sourcegear.graph.GraphImplicits._
    val m = astGraph.modelNodes

    require(modelNode.isDefined, s"Tag ${tag} not found")
    val modelId = nodeKeyStore.leaseId(sourceGearContext.file, modelNode.get)
    val stagedMutation = stagedTagMutation.toStagedMutation(modelId)

    Mutate.fromStagedMutation(stagedMutation)
  }

  def mutateContainer(parentModel: ExpandedModelNode, containerName: String, stagedContainerMutation: ContainerMutationOperation)(implicit sourceGearContext: SGContext, project: OpticProject, nodeKeyStore: NodeKeyStore, context: FlatContextBase = null) = {
    implicit val astGraph = sourceGearContext.astGraph
    implicit val nodeMutatorMap = sourceGearContext.parser.marvinSourceInterface.asInstanceOf[NodeMutatorMap]
    val containerOption = parentModel.containerMapping.get(containerName)

    containerOption.map(containerAstNode=> {

      val containerAstNode = containerOption.get
      val currentContents = sourceGearContext.fileContents.substring(containerAstNode.range)

      val marvinAstNodeContainer = containerAstNode.toMarvinAstNode(astGraph, sourceGearContext.fileContents, sourceGearContext.parser)
      val blockPropertyPath = sourceGearContext.parser.blockNodeTypes.getPropertyPath(containerAstNode.nodeType).get

      val array = marvinAstNodeContainer.properties.getOrElse(blockPropertyPath, AstArray()).asInstanceOf[AstArray]

      def renderItems(items: Seq[StagedNode]) = items.map(sn => Render.fromStagedNode(sn)(sourceGearContext.sourceGear, context).get._1)

      val newArray: AstArray = stagedContainerMutation match {
        case Append(items) => AstArray(array.children ++ renderItems(items):_*)
        case Prepend(items) => AstArray((renderItems(items) ++ array.children):_*)
        case ReplaceWith(items) => AstArray(renderItems(items):_*)
        case InsertAt(index: Int, items) => AstArray(array.children.patch(index, renderItems(items), 0):_*)
        case Empty() => AstArray()
      }


      val newProperties: AstProperties = marvinAstNodeContainer.properties + (blockPropertyPath -> newArray)

      val changes = marvinAstNodeContainer.mutator.applyChanges(marvinAstNodeContainer, newProperties)

      (containerAstNode.range, changes)

    })
  }
}
