package com.opticdev.core.sourcegear.graph.model

import com.opticdev.common.utils.JsonUtils
import com.opticdev.common.{ObjectRef, SchemaRef}
import com.opticdev.core.sourcegear.{AstDebugLocation, CompiledLens, SGContext}
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.annotations.{SourceAnnotation, TagAnnotation}
import com.opticdev.core.sourcegear.containers.ContainerAstMapping
import com.opticdev.core.sourcegear.gears.helpers.{FlattenModelFields, ModelField}
import com.opticdev.core.sourcegear.gears.parsing.{MultiNodeParseGear, ParseGear}
import com.opticdev.core.sourcegear.graph.edges.{ContainerRoot, YieldsModel, YieldsModelProperty, YieldsProperty}
import com.opticdev.core.sourcegear.graph.{AstProjection, FileNode, ProjectGraph}
import com.opticdev.core.sourcegear.project.{OpticProject, Project, ProjectBase}
import com.opticdev.core.sourcegear.variables.VariableManager
import com.opticdev.common.graph.{AstGraph, BaseNode, CommonAstNode, WithinFile}
import play.api.libs.json.{JsObject, Json}
import com.opticdev.core.utils.UUID
import com.opticdev.sdk.VariableMapping
import com.opticdev.sdk.skills_sdk.LensRef
import com.opticdev.sdk.skills_sdk.schema.OMSchema

import scala.util.Try
import scala.util.hashing.MurmurHash3
import collection.JavaConverters._

sealed abstract class BaseModelNode(implicit val project: ProjectBase) extends AstProjection with HasAnnotations {
  def schemaId : SchemaRef
  def value : JsObject
  def hiddenValue : JsObject
  def expandedValue(withVariables: Boolean = false)(implicit sourceGearContext: SGContext) : JsObject
  def lensRef: LensRef
  def variableMapping: VariableMapping
  def priority: Int

  def objectRef: Option[ObjectRef] = annotations.name.map(_.objectRef)
  def sourceAnnotation: Option[SourceAnnotation] = annotations.source
  def tag: Option[TagAnnotation] = annotations.tag

  def matchesSchema()(implicit sourceGearContext: SGContext): Boolean = {
    val schema = sourceGearContext.sourceGear.findSchema(schemaId).getOrElse(OMSchema(schemaId, JsObject.empty))
    schema.validate(JsonUtils.removeReservedFields(expandedValue()))
  }

  def matchesSchemaErrors()(implicit sourceGearContext: SGContext): Try[String] = Try {
    val schema = sourceGearContext.sourceGear.findSchema(schemaId).getOrElse(OMSchema(schemaId, JsObject.empty))
    val report = schema.validationReport(JsonUtils.removeReservedFields(expandedValue()))
    report.iterator().asScala.map(i=> i.getMessage).mkString(", ")
  }

  def internal: Boolean

  def hash: String

  def fileNode: Option[FileNode] = {
    import com.opticdev.core.sourcegear.graph.GraphImplicits._
    project.projectGraph
    .allPredecessorOf(this).find(_.isInstanceOf[FileNode])
    .asInstanceOf[Option[FileNode]]
  }

  def fileNode(projectGraph: ProjectGraph): Option[FileNode] = {
    import com.opticdev.core.sourcegear.graph.GraphImplicits._
    projectGraph
      .allPredecessorOf(this).find(_.isInstanceOf[FileNode])
      .asInstanceOf[Option[FileNode]]
  }

  def flatten : FlatModelNode = this match {
    case a: SingleModelNode => a.flatten
    case a: MultiModelNode => a
  }

  def getContext()(implicit actorCluster: ActorCluster, project: ProjectBase): Try[SGContext] = Try(SGContext.forModelNode(this).get)

  def includedInSync: Boolean = (sourceAnnotation.isDefined || tag.isDefined || objectRef.isDefined) && !internal

}

trait FlatModelNode extends BaseModelNode
trait ExpandedModelNode extends BaseModelNode {
  def flatten: FlatModelNode
  def containerMapping(implicit astGraph: AstGraph): ContainerAstMapping

  def range(implicit astGraph: AstGraph) = this match {
    case mn: LinkedModelNode[CommonAstNode] => mn.root.range
    case mmn: MultiModelNode => mmn.combinedRange(astGraph)
  }

  def variableManager: VariableManager

  def toDebugLocation: AstDebugLocation

}

trait SingleModelNode extends BaseModelNode {

  def mapSchemaFields()(implicit sourceGearContext: SGContext) : Set[ModelField] = {
    val listenersOption = sourceGearContext.fileAccumulator.listeners.get(lensRef)
    if (listenersOption.isDefined) {
      listenersOption.get.flatMap(i => i.collect(sourceGearContext.astGraph, this, sourceGearContext).toOption)
    } else {
      Set.empty
    }
  }

  def flatten : FlatModelNode
  def resolved()(implicit actorCluster: ActorCluster): LinkedModelNode[CommonAstNode] = this match {
    case l: LinkedModelNode[CommonAstNode] => l
    case m: ModelNode => m.resolve[CommonAstNode]()
  }

  private var expandedValueStore : Option[JsObject] = None
  def expandedValue(withVariables: Boolean = false)(implicit sourceGearContext: SGContext) : JsObject = {
    if (expandedValueStore.isDefined) return expandedValueStore.get

    val listenersOption = sourceGearContext.fileAccumulator.listeners.get(lensRef)
    if (listenersOption.isDefined) {
      val modelFields = listenersOption.get.map(i => i.collect(sourceGearContext.astGraph, this, sourceGearContext))
      expandedValueStore = Option(FlattenModelFields.flattenFields(modelFields.collect{case i if i.isSuccess => i.get}, value))
    } else {
      expandedValueStore = Option(value)
    }

    val overrides = valueOverrides()

    if (overrides.nonEmpty) {
      expandedValueStore = Option(FlattenModelFields.flattenFields(overrides.toSet, expandedValueStore.get))
    }

    if (withVariables) {
      expandedValueStore.get + ("_variables", Json.toJson(variableMapping))
    } else {
      expandedValueStore.get
    }

  }

}

case class LinkedModelNode[N <: WithinFile](schemaId: SchemaRef,
                                            value: JsObject,
                                            hiddenValue: JsObject,
                                            lensRef: LensRef,
                                            priority: Int,
                                            root: N,
                                            modelMapping: ModelAstMapping,
                                            containerMappingStore: ContainerAstMapping,
                                            parseGear: ParseGear,
                                            variableMapping: VariableMapping,
                                            internal: Boolean = false)(implicit override val project: ProjectBase) extends BaseModelNode with SingleModelNode with ExpandedModelNode {

  def containerMapping(implicit astGraph: AstGraph): ContainerAstMapping = containerMappingStore

  def variableManager: VariableManager = parseGear.variableManager

  def hash = {
    val modelMappingHashString = modelMapping.toSeq.sortBy(_._1.toString).toString()
    val containerAstMappingString = containerMappingStore.toSeq.sortBy(_._1).toString()
    Integer.toHexString(MurmurHash3.stringHash(root.toString + modelMappingHashString + containerAstMappingString))
  }

  override def flatten : ModelNode = {
    val mn = ModelNode(schemaId, value, hiddenValue, lensRef, priority, variableMapping, hash, internal)
    mn.attachAnnotations(annotations)
    mn
  }
  override lazy val fileNode: Option[FileNode] = flatten.fileNode

  def toDebugLocation = AstDebugLocation(fileNode.map(_.filePath).getOrElse(""), root.range)
}

case class ModelNode(schemaId: SchemaRef,
                     value: JsObject,
                     hiddenValue: JsObject,
                     lensRef: LensRef,
                     priority: Int,
                     variableMapping: VariableMapping,
                     hash: String,
                     internal: Boolean = false)(implicit override val project: ProjectBase) extends BaseModelNode with SingleModelNode with FlatModelNode {

  //@todo check how stable/collision prone this is
  override val id: String = hash

  def resolveInGraph[T <: WithinFile](graph: AstGraph) : LinkedModelNode[T] = {
    implicit val astGraph = graph
    val labeledDependencies = astGraph.get(this).labeledDependencies
    val root : T = labeledDependencies.find(i=> i._1.isInstanceOf[YieldsModel] && i._1.asInstanceOf[YieldsModel].root)
      .get._2.asInstanceOf[T]
    val parseGear = astGraph.get(this).labeledDependencies.find(_._1.isInstanceOf[YieldsModel]).get._1.asInstanceOf[YieldsModel].withParseGear
    val mn = LinkedModelNode(schemaId, value, hiddenValue, lensRef, priority, root, modelMapping, containerMapping, parseGear, variableMapping, internal)
    mn.attachAnnotations(annotations)
    mn
  }

  def resolve[T <: WithinFile]()(implicit actorCluster: ActorCluster) : LinkedModelNode[T] = {
    implicit val sourceGearContext = SGContext.forModelNode(this).get
    implicit val astGraph = sourceGearContext.astGraph
    resolveInGraph(astGraph)
  }

  def modelMapping(implicit astGraph: AstGraph) : ModelAstMapping = {
    val labeledDependencies = astGraph.get(this).labeledDependencies
    labeledDependencies.filter(_._1.isInstanceOf[YieldsModelProperty]).map {
      case (edge, node) => {
        edge match {
          case property: YieldsModelProperty =>
            property match {
              case YieldsProperty(path, relationship) => (path, NodeMapping(node.asInstanceOf[CommonAstNode], relationship))
            }
        }
      }
    }.groupBy(_._1).mapValues(_.map(_._2))
     .asInstanceOf[ModelAstMapping]
  }

  def containerMapping(implicit astGraph: AstGraph) : ContainerAstMapping = {
    val labeledDependencies = astGraph.get(this).labeledDependencies
    labeledDependencies.filter(_._1.isInstanceOf[ContainerRoot]).map {
      case (edge, node) => {
        edge match {
          case property: ContainerRoot =>
            property match {
              case ContainerRoot(name) => (name, node.asInstanceOf[CommonAstNode])
            }
        }
      }
    }.toMap
  }

  override def flatten : ModelNode = this

}


case class MultiModelNode(schemaId: SchemaRef,
                          lensRef: LensRef,
                          priority: Int,
                          parseGear: MultiNodeParseGear,
                          modelNodes: Seq[ModelNode])(implicit override val project: ProjectBase) extends BaseModelNode with FlatModelNode with ExpandedModelNode {

  override def internal: Boolean = false //always false for now

  override def value: JsObject = modelNodes.foldLeft(JsObject.empty) {
    case (aggregate, modelNode) => aggregate ++ modelNode.value
  }

  override def hiddenValue: JsObject = modelNodes.foldLeft(JsObject.empty) {
    case (aggregate, modelNode) => aggregate ++ modelNode.hiddenValue
  }

  lazy val hash: String = {
    Integer.toHexString(
        MurmurHash3.stringHash(schemaId.full) ^
        MurmurHash3.stringHash(lensRef.full) ^
        MurmurHash3.stringHash(modelNodes.map(_.hash).mkString)
    )
  }

  def containerMapping(implicit astGraph: AstGraph): ContainerAstMapping = {
    modelNodes.map(_.containerMapping(astGraph)).foldLeft(Map.empty[String, CommonAstNode]){_ ++ _}
  }

  def variableMapping = modelNodes.map(_.variableMapping).fold(Map.empty) {_ ++ _}

  def variableManager: VariableManager = parseGear.variableManager

  override def objectRef: Option[ObjectRef] = modelNodes.find(_.objectRef.isDefined).flatMap(_.objectRef) //uses the first instance found
  override def sourceAnnotation: Option[SourceAnnotation] = modelNodes.find(_.sourceAnnotation.isDefined).flatMap(_.sourceAnnotation) //uses the first instance found
  override def tag: Option[TagAnnotation] = modelNodes.find(_.tag.isDefined).flatMap(_.tag) //uses the first instance found

  def expandedValue(withVariables: Boolean)(implicit sourceGearContext: SGContext): JsObject = {
    val results = modelNodes.foldLeft((JsObject.empty, JsObject.empty)) {
      case ((entire, variables), modelNode) => {
        val modelValue = modelNode.expandedValue(true)
        val modelVariables = (modelValue \ "_variables").getOrElse(JsObject.empty).as[JsObject]

        (entire ++ modelValue - "_variables", variables ++ modelVariables)
      }
    }

    if (withVariables) {
      results._1 + ("_variables" -> results._2)
    } else {
      results._1
    }
  }

  def combinedRange(implicit sourceGearContext: SGContext): Range = combinedRange(sourceGearContext.astGraph)

  def combinedRange(implicit astGraph: AstGraph): Range = {
    val ranges = modelNodes.map(_.resolveInGraph[CommonAstNode](astGraph)).map(_.root.range)
    Range(ranges.map(_.start).min, ranges.map(_.end).max)
  }

  def toDebugLocation: AstDebugLocation = AstDebugLocation(fileNode.map(_.filePath).getOrElse(""), Range(0,0)) //@get a real range added

}