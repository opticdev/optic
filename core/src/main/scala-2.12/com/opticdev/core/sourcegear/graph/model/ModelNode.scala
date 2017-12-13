package com.opticdev.core.sourcegear.graph.model

import com.opticdev.sdk.descriptions.SchemaId
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.gears.helpers.FlattenModelFields
import com.opticdev.core.sourcegear.gears.parsing.ParseGear
import com.opticdev.core.sourcegear.graph.edges.{YieldsModel, YieldsModelProperty, YieldsProperty}
import com.opticdev.core.sourcegear.graph.{AstProjection, FileNode}
import com.opticdev.core.sourcegear.project.{OpticProject, Project}
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{AstPrimitiveNode, BaseNode}
import play.api.libs.json.JsObject
import com.opticdev.core.utils.UUID

import scala.util.Try


sealed abstract class BaseModelNode(implicit val project: OpticProject) extends AstProjection {
  val schemaId : SchemaId
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

  def getContext()(implicit actorCluster: ActorCluster, project: OpticProject): Try[SGContext] = Try(SGContext.forModelNode(this).get)

}

case class LinkedModelNode(schemaId: SchemaId, value: JsObject, root: AstPrimitiveNode, mapping: ModelAstMapping, parseGear: ParseGear)(implicit override val project: OpticProject) extends BaseModelNode {
  def flatten = ModelNode(schemaId, value)
  override lazy val fileNode: Option[FileNode] = flatten.fileNode
}

case class ModelNode(schemaId: SchemaId, value: JsObject)(implicit override val project: OpticProject) extends BaseModelNode {

  def resolve()(implicit actorCluster: ActorCluster) : LinkedModelNode = {
    implicit val sourceGearContext = SGContext.forModelNode(this).get
    implicit val astGraph = sourceGearContext.astGraph
    val labeledDependencies = astGraph.get(this).labeledDependencies
    val root : AstPrimitiveNode = labeledDependencies.find(i=> i._1.isInstanceOf[YieldsModel] && i._1.asInstanceOf[YieldsModel].root)
                                  .get._2.asInstanceOf[AstPrimitiveNode]
    val mapping : ModelAstMapping = labeledDependencies.filter(_._1.isInstanceOf[YieldsModelProperty]).map {
      case (edge, node) => {
        edge match {
          case property: YieldsModelProperty =>
            property match {
              case YieldsProperty(path, relationship) => (path, NodeMapping(node.asInstanceOf[AstPrimitiveNode], relationship))
            }
        }
      }
    }.toMap

    val parseGear = astGraph.get(this).labeledDependencies.find(_._1.isInstanceOf[YieldsModel]).get._1.asInstanceOf[YieldsModel].withParseGear

    LinkedModelNode(schemaId, value, root, mapping, parseGear)
  }

}
