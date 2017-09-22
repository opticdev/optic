package com.opticdev.core.sourcegear.accumulate

import com.opticdev.core.sdk.descriptions.{SchemaComponent, SchemaId}
import com.opticdev.core.sourcegear.gears.helpers.{FlattenModelFields, LocationEvaluation, ModelField}
import com.opticdev.parsers.AstGraph
import play.api.libs.json.{JsArray, JsObject}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import com.opticdev.core.sourcegear.graph.GraphImplicits._
import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship
import com.opticdev.core.sourcegear.graph.model.{LinkedModelNode, ModelNode, ModelVector}

sealed trait Listener {
  def collect()(implicit astGraph: AstGraph)
  val schema: SchemaId
}

case class MapSchemaListener(schemaComponent: SchemaComponent, mapToSchema: SchemaId) extends Listener {
  override val schema = schemaComponent.schema
  override def collect()(implicit astGraph: AstGraph): Unit = {

    val modelNodes = astGraph.modelNodes

    val mapToNodes = astGraph.modelNodes.ofType(mapToSchema)
    val targetNodes = astGraph.modelNodes.ofType(schema)

    mapToNodes.foreach(instance=> {
      val astRoot = instance.astRoot
      val addToNodes = targetNodes
        .filter(n=> LocationEvaluation.matches(schemaComponent.location, n.astRoot, astRoot))
        .toVector
        .sortBy(_.astRoot.range._1)

      val modelFields = ModelField(schemaComponent.propertyPath, JsArray(addToNodes.map(_.value)), ModelVector(addToNodes.map(i=> i.asInstanceOf[LinkedModelNode].flatten)))

      val newModel = FlattenModelFields.flattenFields(Set(modelFields), instance.value)

      //@todo remove this casting
      instance.asInstanceOf[ModelNode].silentUpdate(newModel)
    })

  }
}
