package com.opticdev.core.sourcegear.accumulate

import com.opticdev.sdk.descriptions.{SchemaComponent, SchemaRef}
import com.opticdev.core.sourcegear.gears.helpers.{FlattenModelFields, LocationEvaluation, ModelField}
import com.opticdev.parsers.AstGraph
import play.api.libs.json.{JsArray, JsObject, JsValue}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import com.opticdev.core.sourcegear.graph.GraphImplicits._
import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, LinkedModelNode, ModelNode, ModelVectorMapping}
import com.opticdev.sdk.descriptions.enums.LocationEnums.InCurrentLens

sealed trait Listener {
  def collect(implicit astGraph: AstGraph) : Vector[ModelField]
  val schema: SchemaRef
  val mapToSchema: SchemaRef
}

case class MapSchemaListener(schemaComponent: SchemaComponent, mapToSchema: SchemaRef) extends Listener {
  override val schema = schemaComponent.schema
  override def collect(implicit astGraph: AstGraph) : Vector[ModelField] = {

    val modelNodes = astGraph.modelNodes

    val mapToNodes = astGraph.modelNodes.ofType(mapToSchema)
    val targetNodes = astGraph.modelNodes.ofType(schema)

    mapToNodes.map(instance=> {

      val astRoot = instance.astRoot
      val containerMapping = instance.asInstanceOf[ModelNode].containerMapping
      val addToNodes = {
        val found = targetNodes
          .filter(n=> LocationEvaluation.matches(schemaComponent.location.get, n.astRoot, astRoot, containerMapping))
          .sortBy(_.astRoot.range.start)

        //account for different map schema types
        if (schemaComponent.mapUnique) {
          import com.opticdev.core.utils.VectorDistinctBy.distinctBy
          distinctBy[BaseModelNode, JsValue](found)((a)=> a.value)
        } else {
          found
        }
      }

      ModelField(schemaComponent.propertyPath, JsArray(addToNodes.map(_.value)), ModelVectorMapping(addToNodes.map(i=> i.asInstanceOf[ModelNode])))
    })

  }
}
