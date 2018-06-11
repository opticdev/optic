package com.opticdev.core.sourcegear.sync

import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.annotations.TagAnnotation
import com.opticdev.core.sourcegear.context.FlatContextBase
import com.opticdev.core.sourcegear.{Render, SGContext, SourceGear}
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.core.sourcegear.graph.edges.DerivedFrom
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}
import com.opticdev.core.sourcegear.project.ProjectBase
import com.opticdev.parsers.graph.{BaseNode, CommonAstNode}
import com.opticdev.sdk.descriptions.transformation.Transformation
import jdk.internal.org.objectweb.asm.tree.analysis.SourceValue
import play.api.libs.json.{JsObject, JsString}
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import com.opticdev.marvin.common.helpers.InRangeImplicits._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.collection.mutable
import scala.concurrent.Future
import scala.util.Try
import com.opticdev.core.sourcegear.graph.GraphImplicits._
import com.opticdev.core.sourcegear.mutate.MutationSteps.{collectFieldChanges, combineChanges, handleChanges}
import com.opticdev.core.sourcegear.snapshot.Snapshot
import com.opticdev.parsers.ParserBase
import com.opticdev.sdk.descriptions.transformation.generate.{GenerateResult, RenderOptions, StagedNode}

object DiffSyncGraph {

  def calculateDiff(snapshot: Snapshot)(implicit project: ProjectBase, includeNoChange: Boolean = false) : SyncPatch = {

    implicit val sourceGear = snapshot.sourceGear

    val resultsFromSyncGraph = SyncGraph.getSyncGraph(snapshot)
    val projectPlusSyncGraph: Graph[BaseNode, LkDiEdge] = resultsFromSyncGraph.syncGraph.asInstanceOf[Graph[BaseNode, LkDiEdge]]
    implicit val graph: Graph[BaseNode, LkDiEdge] = projectPlusSyncGraph.filter(projectPlusSyncGraph.having(edge = (e) => e.isLabeled && e.label.isInstanceOf[DerivedFrom]))

    val startingNodes= graph.nodes.collect { case n if n.dependencies.isEmpty => n.value.asInstanceOf[BaseModelNode] }.toVector

    def compareDiffAlongPath(sourceNode: BaseModelNode, predecessorDiff: Option[SyncDiff] = None) : Vector[SyncDiff] = {
      val sourceValue = {
        if (predecessorDiff.exists(_.newValue.isDefined)) {
          predecessorDiff.get.newValue.get
        } else {
          snapshot.expandedValues(sourceNode.flatten)
        }
      }
      sourceNode.labeledDependents.toVector.flatMap {
        case (label: DerivedFrom, targetNode: BaseModelNode) => {

          val diff = compareNode(label, sourceNode, sourceValue, targetNode)(sourceGear, snapshot, project)

          val diffWithTrigger = diff match {
            //if its parent has a trigger, take it...
            case r: Replace if predecessorDiff.exists(_.isInstanceOf[Replace]) && predecessorDiff.get.asInstanceOf[Replace].trigger.isDefined => r.copy(trigger = predecessorDiff.get.asInstanceOf[Replace].trigger)
            //if its the trigger set it equal to itself
            case r: Replace if predecessorDiff.isEmpty || predecessorDiff.exists(_.newValue.isEmpty) => r.copy(trigger = Some(Trigger(sourceNode.objectRef.get.name, sourceNode.schemaId, r.after)))
            //return self
            case d=> d
          }

          Vector(diffWithTrigger) ++ compareDiffAlongPath(targetNode, Some(diffWithTrigger))

        }
        case _ => Vector()   ///should never be hit
      }
    }
    SyncPatch(startingNodes.flatMap(i=> compareDiffAlongPath(i)).filterNot(i=> i.isInstanceOf[NoChange] && !includeNoChange), resultsFromSyncGraph.warnings)
  }

  def compareNode(label: DerivedFrom, sourceNode: BaseModelNode, sourceValue: JsObject, targetNode: BaseModelNode)(implicit sourceGear: SourceGear, snapshot: Snapshot, project: ProjectBase) = {
    import com.opticdev.core.sourcegear.graph.GraphImplicits._
    val extractValuesTry = for {
      transformation <- Try(sourceGear.findTransformation(label.transformationRef).getOrElse(throw new Error(s"No Transformation with id '${label.transformationRef.full}' found")))
      transformationResult <- transformation.transformFunction.transform(sourceValue, label.askAnswers, sourceGear.transformationCaller, None)
      (currentValue, linkedModel, context) <- Try {
        (snapshot.expandedValues(targetNode.flatten), snapshot.linkedModelNodes(targetNode.flatten), snapshot.contextForNode(targetNode.flatten))
      }
      (expectedValue, expectedRaw) <- Try {

        val prefixedFlatContent: FlatContextBase = sourceGear.flatContext.prefix(transformation.packageId.packageId)

        //@todo need a better approach to this since mutation transforms are not syncable
        val stagedNode = transformationResult.asInstanceOf[GenerateResult].toStagedNode(Some(RenderOptions(
          lensId = Some(targetNode.lensRef.full)
        )))

        implicit val sourceGearContext: SGContext = snapshot.contextForNode(targetNode.flatten)
        val tagVector = sourceGearContext.astGraph.nodes.filter(_.value match {
          case mn: BaseModelNode if mn.tag.isDefined &&
            stagedNode.tags.map(_._1).contains(mn.tag.get.tag) &&
            stagedNode.tagsMap(mn.tag.get.tag).schema.matchLoose(mn.schemaId) && //reduces ambiguity. need a long term fix.
            linkedModel.root.hasChild(snapshot.linkedModelNodes(mn.flatten).root)(sourceGearContext.astGraph) => true
          case _ => false
        }).map(i=> (i.value.asInstanceOf[BaseModelNode].tag.get.tag, i.value.asInstanceOf[BaseModelNode]))
          .toVector
          .sortBy(t=> stagedNode.tags.indexWhere(_._1 == t))

        val tagPatches: Seq[SyncDiff] = tagVector.collect {
          case (tag, targetTagNode) => {
            val tagStaged = stagedNode.tagsMap(tag)
            val tagStagedValues = expectedValuesForStagedNode(tagStaged, prefixedFlatContent)
            val targetTagValue = targetTagNode.expandedValue()
            if (tagStagedValues._1 == targetTagValue) {
              NoChange(label, targetTagNode.tag)
            } else {
              UpdatedTag(tag, label, targetTagNode, targetTagValue, tagStagedValues._1, null)
            }
          }
        }

        val rawAfterTags = tagPatches.foldLeft(sourceGearContext.fileContents.substring(linkedModel.root)) {
          case (current: String, ut: UpdatedTag) =>
            updateNodeFromRaw(stagedNode, Some(ut.modelNode.tag.get), ut.after, current)(sourceGear, prefixedFlatContent, context.parser)

          case (c, p) => c
        }

        val (expectedValue, expectedRaw) = expectedValuesForStagedNode(stagedNode, prefixedFlatContent)
        val newExpectedRaw = updateNodeFromRaw(stagedNode, None, expectedValue, rawAfterTags)(sourceGear, prefixedFlatContent, context.parser)
        (expectedValue, newExpectedRaw)
      }
    } yield (expectedValue, currentValue, linkedModel, expectedRaw, context)

    if (extractValuesTry.isSuccess) {
      val (expectedValue, currentValue, linkedModel, expectedRaw, context) = extractValuesTry.get
      if (expectedValue == currentValue) {
        NoChange(label)
      } else {
        Replace(label, targetNode.schemaId, currentValue, expectedValue,
          RangePatch(linkedModel.root.range, expectedRaw, context.file, context.fileContents))
      }
    } else {
//      println(extractValuesTry.failed.get.printStackTrace())
      ErrorEvaluating(label, extractValuesTry.failed.get.getMessage, snapshot.linkedModelNodes(targetNode.flatten).toDebugLocation)
    }

  }

  def expectedValuesForStagedNode(stagedNode: StagedNode, context: FlatContextBase)(implicit sourceGear: SourceGear): (JsObject, String) = {
    val variables = stagedNode.options.flatMap(_.variables).getOrElse(Map.empty)
    val generatedNode = Render.fromStagedNode(stagedNode, variables)(sourceGear, context).get
    val value = generatedNode._3.renderer.parseAndGetModel(generatedNode._2)(sourceGear, context).get
    val raw = generatedNode._2
    (value, raw)
  }

  def updateNodeFromRaw(masterStagedNode: StagedNode, targetNodeOption: Option[TagAnnotation], newValue: JsObject, raw: String)(implicit sourceGear: SourceGear, context: FlatContextBase, parser: ParserBase) = {
    import com.opticdev.core.sourcegear.mutate.MutationImplicits._
    val lens = Render.resolveLens(masterStagedNode).get
    val (value, astGraph, modelNode) = lens.renderer.parseAndGetModelWithGraph(raw).get

    implicit val sourceGearContext = SGContext.forRender(sourceGear, astGraph, parser.parserRef)
    implicit val fileContents = raw

    if (targetNodeOption.isDefined) {
      val tag = targetNodeOption.get
      val variables = masterStagedNode.variablesForTag(tag.tag)
      val taggedModelNode = astGraph.modelNodes.find(_.tag.contains(tag)).get.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](astGraph)
      val variableChanges = taggedModelNode.parseGear.variableManager.changesFromMapping(variables)
      taggedModelNode.update(newValue, Some(variableChanges))
    } else {
      val variableChanges = lens.parser.variableManager.changesFromMapping(masterStagedNode.options.flatMap(_.variables).getOrElse(Map.empty))
      modelNode.resolveInGraph[CommonAstNode](astGraph).update(newValue, Some(variableChanges))
    }

  }

}
