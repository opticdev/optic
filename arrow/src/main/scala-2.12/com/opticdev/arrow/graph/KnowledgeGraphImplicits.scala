package com.opticdev.arrow.graph

import com.opticdev.core.sourcegear.Gear
import com.opticdev.sdk.descriptions.{SchemaRef, Transformation}

object KnowledgeGraphImplicits {

  sealed trait TransformationChanges {
    val transformation: Transformation
  }

  case class DirectTransformation(transformation: Transformation, target: SchemaRef) extends TransformationChanges

  implicit class KnowledgeGraphWrapper(knowledgeGraph: KnowledgeGraph) {

    def schemaNodeForRef(schemaRef: SchemaRef): Option[SchemaNode] =
      knowledgeGraph.nodes.find(i=> i.value.isInstanceOf[SchemaNode] && i.value.asInstanceOf[SchemaNode].schema.schemaRef == schemaRef)
      .map(i=> i.value.asInstanceOf[SchemaNode])

    def gearsForSchema(schemaRef: SchemaRef) : Set[Gear] = {

      schemaNodeForRef(schemaRef).map(i => {
        knowledgeGraph
          .get(i)
          .edges
          .filter(e => e.isUndirected && e.to != this && e.to.value.isInstanceOf[GearNode])
          .map(i => {
            i.to.value.asInstanceOf[GearNode].gear
          }).toSet
      }).getOrElse(Set())
        .asInstanceOf[Set[Gear]]
    }

    def availableTransformations(schemaRef: SchemaRef) : Set[TransformationChanges] = {
      schemaNodeForRef(schemaRef).map(i => {
        knowledgeGraph
          .get(i)
          .edges
          .filter(e => e.isOut && e.to != this && e.label.isInstanceOf[Transformation])
          .map(i => {
            DirectTransformation(i.label.asInstanceOf[Transformation], i.to.value.asInstanceOf[SchemaNode].schema.schemaRef)
          }).toSet
      }).getOrElse(Set())
        .asInstanceOf[Set[TransformationChanges]]
    }

  }
}
