package com.opticdev.core.sourcegear.graph.model

import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.containers.ContainerAstMapping
import com.opticdev.core.sourcegear.gears.helpers.FlattenModelFields
import com.opticdev.core.sourcegear.gears.parsing.ParseGear
import com.opticdev.core.sourcegear.graph.edges.{ContainerRoot, YieldsModel, YieldsModelProperty, YieldsProperty}
import com.opticdev.core.sourcegear.graph.{AstProjection, FileNode}
import com.opticdev.core.sourcegear.project.{OpticProject, Project, ProjectBase}
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{BaseNode, CommonAstNode, WithinFile}
import play.api.libs.json.JsObject
import com.opticdev.core.utils.UUID

import scala.util.Try
import scala.util.hashing.MurmurHash3


sealed abstract class BaseModelNode(implicit val project: ProjectBase) extends AstProjection {
  val schemaId : SchemaRef
  val value : JsObject

  lazy val fileNode: Option[FileNode] = {
      import com.opticdev.core.sourcegear.graph.GraphImplicits._
      project.projectGraph
      .allPredecessorOf(this).find(_.isInstanceOf[FileNode])
      .asInstanceOf[Option[FileNode]]
  }

  private var expandedValueStore : Option[JsObject] = None
  def expandedValue()(implicit sourceGearContext: SGContext) : JsObject = {
    if (expandedValueStore.isDefined) return expandedValueStore.get

    val listenersOption = sourceGearContext.fileAccumulator.listeners.get(schemaId)
    if (listenersOption.isDefined) {
      val modelFields = listenersOption.get.flatMap(i => i.collect(sourceGearContext.astGraph))
      expandedValueStore = Option(FlattenModelFields.flattenFields(modelFields, value))
    } else {
      expandedValueStore = Option(value)
    }

    expandedValueStore.get
  }

  def getContext()(implicit actorCluster: ActorCluster, project: ProjectBase): Try[SGContext] = Try(SGContext.forModelNode(this).get)

}

case class LinkedModelNode[N <: WithinFile](schemaId: SchemaRef, value: JsObject, root: N, modelMapping: ModelAstMapping, containerMapping: ContainerAstMapping, parseGear: ParseGear)(implicit override val project: ProjectBase) extends BaseModelNode {
  def flatten = {
    val hash = MurmurHash3.stringHash(root.toString() + modelMapping.toString() + containerMapping.toString())
    ModelNode(schemaId, value, hash)
  }
  override lazy val fileNode: Option[FileNode] = flatten.fileNode
}

case class ModelNode(schemaId: SchemaRef, value: JsObject, hash: Int)(implicit override val project: ProjectBase) extends BaseModelNode {

  def resolve[T <: WithinFile]()(implicit actorCluster: ActorCluster) : LinkedModelNode[T] = {
    implicit val sourceGearContext = SGContext.forModelNode(this).get
    implicit val astGraph = sourceGearContext.astGraph
    val labeledDependencies = astGraph.get(this).labeledDependencies
    val root : T = labeledDependencies.find(i=> i._1.isInstanceOf[YieldsModel] && i._1.asInstanceOf[YieldsModel].root)
                                  .get._2.asInstanceOf[T]

    val parseGear = astGraph.get(this).labeledDependencies.find(_._1.isInstanceOf[YieldsModel]).get._1.asInstanceOf[YieldsModel].withParseGear

    LinkedModelNode(schemaId, value, root, modelMapping, containerMapping, parseGear)
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

}
