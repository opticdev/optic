package com.opticdev.core.sourcegear.accumulate

import com.opticdev.common.SchemaRef
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.gears.helpers.{FlattenModelFields, LocationEvaluation, ModelField}
import com.opticdev.parsers.AstGraph
import play.api.libs.json._
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import com.opticdev.core.sourcegear.graph.GraphImplicits._
import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, LinkedModelNode, ModelNode, ModelVectorMapping}
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.sdk.descriptions.enums.LocationEnums.InCurrentLens
import com.opticdev.core.sourcegear.context.SDKObjectsResolvedImplicits._
import com.opticdev.parsers.graph.path.PropertyPathWalker
import com.opticdev.sdk.opticmarkdown2.lens.{OMComponentWithPropertyPath, OMLensSchemaComponent}
sealed trait Listener {
  def collect(implicit astGraph: AstGraph, modelNode: BaseModelNode, sourceGearContext: SGContext) : ModelField
  val schema: SchemaRef
  val mapToSchema: SchemaRef
}

case class MapSchemaListener(schemaComponent: OMComponentWithPropertyPath[OMLensSchemaComponent], mapToSchema: SchemaRef, packageId: String) extends Listener {

  override val schema = schemaComponent.component.schemaRef
  override def collect(implicit astGraph: AstGraph, modelNode: BaseModelNode, sourceGearContext: SGContext): ModelField = {

    val resolvedSchema = schemaComponent.component.resolvedSchema(packageId)(sourceGearContext.sourceGear)

    val asModelNode : ModelNode = modelNode match {
      case l: LinkedModelNode[CommonAstNode] => l.flatten
      case mN: ModelNode => mN
    }

    val targetNodes = astGraph.modelNodes.ofType(resolvedSchema)


    val astRoot = asModelNode.astRoot
    val containerMapping = asModelNode.asInstanceOf[ModelNode].containerMapping
    val addToNodes = {
      val found = targetNodes
        .filter(n=> LocationEvaluation.matches(schemaComponent.component.locationForCompiler.get, n.astRoot, astRoot, containerMapping))
        .sortBy(_.astRoot.range.start)

      //check for priority overrides
      val filteredFound = {


      }
      found.combinations(2)

      //account for different map schema types
      if (schemaComponent.component.unique) {
        import com.opticdev.core.utils.VectorDistinctBy.distinctBy
        distinctBy[BaseModelNode, JsValue](found)((a)=> a.expandedValue())
      } else {
        found
      }
    }

    if (schemaComponent.component.toMap.isDefined) {
      val keyValues = addToNodes.map {
        n => {
          val value = n.expandedValue()
          val keyOption = new PropertyPathWalker(value).getProperty(schemaComponent.component.toMap.get.split("\\."))
            .filterNot(i => i.isInstanceOf[JsObject] || i.isInstanceOf[JsArray] || i.isInstanceOf[JsBoolean] || i == JsNull)
            .map {
              case JsString(s) => s
              case JsNumber(n) => n.toString
            }
          keyOption.map(key => key -> value)
        }
      }.collect {case n if n.isDefined => n.get }

      ModelField(schemaComponent.propertyPath, JsObject(keyValues), ModelVectorMapping(addToNodes.map(i=> i.asInstanceOf[ModelNode])))
    } else {
      ModelField(schemaComponent.propertyPath, JsArray(addToNodes.map(_.expandedValue())), ModelVectorMapping(addToNodes.map(i=> i.asInstanceOf[ModelNode])))
    }
  }
}
