package com.opticdev.core.sourcegear.graph.model

import com.opticdev.common.ObjectRef
import com.opticdev.sdk.descriptions.{LensRef, SchemaRef}
import com.opticdev.core.sourcegear.{AstDebugLocation, CompiledLens, SGContext}
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.containers.ContainerAstMapping
import com.opticdev.core.sourcegear.gears.helpers.{FlattenModelFields, ModelField}
import com.opticdev.core.sourcegear.gears.parsing.ParseGear
import com.opticdev.core.sourcegear.graph.edges.{ContainerRoot, YieldsModel, YieldsModelProperty, YieldsProperty}
import com.opticdev.core.sourcegear.graph.{AstProjection, FileNode, ProjectGraph}
import com.opticdev.core.sourcegear.objects.annotations.{SourceAnnotation, TagAnnotation}
import com.opticdev.core.sourcegear.project.{OpticProject, Project, ProjectBase}
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{BaseNode, CommonAstNode, WithinFile}
import play.api.libs.json.{JsObject, Json}
import com.opticdev.core.utils.UUID
import com.opticdev.sdk.VariableMapping

import scala.util.Try
import scala.util.hashing.MurmurHash3


sealed abstract class BaseModelNode(implicit val project: ProjectBase) extends AstProjection {
  val schemaId : SchemaRef
  val value : JsObject
  val objectRef: Option[ObjectRef]
  val sourceAnnotation: Option[SourceAnnotation]
  val tag: Option[TagAnnotation]
  val lensRef: LensRef
  val variableMapping: VariableMapping

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

  def mapSchemaFields()(implicit sourceGearContext: SGContext) : Set[ModelField] = {
    val listenersOption = sourceGearContext.fileAccumulator.listeners.get(schemaId)
    if (listenersOption.isDefined) {
      listenersOption.get.map(i => i.collect(sourceGearContext.astGraph, this, sourceGearContext))
    } else {
      Set.empty
    }
  }

  private var expandedValueStore : Option[JsObject] = None
  def expandedValue(withVariables: Boolean = false)(implicit sourceGearContext: SGContext) : JsObject = {
    if (expandedValueStore.isDefined) return expandedValueStore.get

    val listenersOption = sourceGearContext.fileAccumulator.listeners.get(schemaId)
    if (listenersOption.isDefined) {
      val modelFields = listenersOption.get.map(i => i.collect(sourceGearContext.astGraph, this, sourceGearContext))
      expandedValueStore = Option(FlattenModelFields.flattenFields(modelFields, value))
    } else {
      expandedValueStore = Option(value)
    }

    if (withVariables) {
      expandedValueStore.get + ("_variables", Json.toJson(variableMapping))
    } else {
      expandedValueStore.get
    }

  }

  def getContext()(implicit actorCluster: ActorCluster, project: ProjectBase): Try[SGContext] = Try(SGContext.forModelNode(this).get)

  def resolved()(implicit actorCluster: ActorCluster): LinkedModelNode[CommonAstNode] = this match {
    case l: LinkedModelNode[CommonAstNode] => l
    case m: ModelNode => m.resolve[CommonAstNode]()
  }

  def flatten : ModelNode

  def includedInSync: Boolean = sourceAnnotation.isDefined || tag.isDefined || objectRef.isDefined

}

case class LinkedModelNode[N <: WithinFile](schemaId: SchemaRef, value: JsObject, lensRef: LensRef, root: N, modelMapping: ModelAstMapping, containerMapping: ContainerAstMapping, parseGear: ParseGear, variableMapping: VariableMapping, objectRef: Option[ObjectRef], sourceAnnotation: Option[SourceAnnotation], tag: Option[TagAnnotation])(implicit override val project: ProjectBase) extends BaseModelNode {

  //not sure this is a better approach
//  def hash = Integer.toHexString(
//    MurmurHash3.stringHash(schemaId.full) ^
//    MurmurHash3.stringHash(value.toString()) ^
//    MurmurHash3.stringHash(lensRef.full) ^
//    MurmurHash3.stringHash(root.hash) ^
//    MurmurHash3.mapHash(modelMapping) ^
//    MurmurHash3.mapHash(containerMapping) ^
//    MurmurHash3.stringHash(objectRef.toString) ^
//    MurmurHash3.stringHash(sourceAnnotation.toString))

  def hash = Integer.toHexString(MurmurHash3.stringHash(root.toString + modelMapping.toString + sourceAnnotation.toString + objectRef.toString + containerMapping.toString))

  def flatten = {
    ModelNode(schemaId, value, lensRef, variableMapping, objectRef, sourceAnnotation, tag, hash)
  }
  override lazy val fileNode: Option[FileNode] = flatten.fileNode

  def toDebugLocation = AstDebugLocation(fileNode.map(_.filePath).getOrElse(""), root.range)
}

case class ModelNode(schemaId: SchemaRef, value: JsObject, lensRef: LensRef, variableMapping: VariableMapping, objectRef: Option[ObjectRef], sourceAnnotation: Option[SourceAnnotation], tag: Option[TagAnnotation], hash: String)(implicit override val project: ProjectBase) extends BaseModelNode {

  //@todo check how stable/collision prone this is
  override val id: String = hash

  def resolveInGraph[T <: WithinFile](graph: AstGraph) : LinkedModelNode[T] = {
    implicit val astGraph = graph
    val labeledDependencies = astGraph.get(this).labeledDependencies
    val root : T = labeledDependencies.find(i=> i._1.isInstanceOf[YieldsModel] && i._1.asInstanceOf[YieldsModel].root)
      .get._2.asInstanceOf[T]
    val parseGear = astGraph.get(this).labeledDependencies.find(_._1.isInstanceOf[YieldsModel]).get._1.asInstanceOf[YieldsModel].withParseGear
    LinkedModelNode(schemaId, value, lensRef, root, modelMapping, containerMapping, parseGear, variableMapping, objectRef, sourceAnnotation, tag)
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
    }.toMap
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

  def flatten : ModelNode = this

}
