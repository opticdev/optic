package com.opticdev.core.sourcegear.accumulate

import com.opticdev.sdk.descriptions.{SchemaComponent, SchemaRef}
import com.opticdev.core.sourcegear.gears.helpers.{FlattenModelFields, LocationEvaluation, ModelField}
import com.opticdev.parsers.AstGraph
import play.api.libs.json.{JsArray, JsObject}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import com.opticdev.core.sourcegear.graph.GraphImplicits._
import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship
import com.opticdev.core.sourcegear.graph.model.{LinkedModelNode, ModelNode, ModelVectorMapping}

sealed trait Listener {
  def collect(implicit astGraph: AstGraph) : Set[ModelField]
  val schema: SchemaRef
  val mapToSchema: SchemaRef
}

case class MapSchemaListener(schemaComponent: SchemaComponent, mapToSchema: SchemaRef) extends Listener {
  override val schema = schemaComponent.schema
  override def collect(implicit astGraph: AstGraph) : Set[ModelField] = {

    val modelNodes = astGraph.modelNodes

    val mapToNodes = astGraph.modelNodes.ofType(mapToSchema)
    val targetNodes = astGraph.modelNodes.ofType(schema)

    mapToNodes.map(instance=> {
      val astRoot = instance.astRoot
      val addToNodes = targetNodes
        .filter(n=> LocationEvaluation.matches(schemaComponent.location, n.astRoot, astRoot))
        .toVector
        .sortBy(_.astRoot.range.start)

      ModelField(schemaComponent.propertyPath, JsArray(addToNodes.map(_.value)), ModelVectorMapping(addToNodes.map(i=> i.asInstanceOf[ModelNode])))
    })

  }
}
