package com.opticdev.arrow.graph

import com.opticdev.common.utils.SemverHelper
import com.opticdev.core.sourcegear.CompiledLens
import com.opticdev.common.SchemaRef
import com.opticdev.sdk.descriptions.transformation.Transformation

object KnowledgeGraphImplicits {

  sealed trait TransformationChanges {
    val transformation: Transformation
  }

  case class DirectTransformation(transformation: Transformation, target: SchemaRef) extends TransformationChanges

  implicit class KnowledgeGraphWrapper(knowledgeGraph: KnowledgeGraph) {

    def schemaNodeForRef(schemaRef: SchemaRef): Option[SchemaNode] = {
      val availibleSchemas = knowledgeGraph.nodes.filter(i=> i.value.isInstanceOf[SchemaNode] && i.value.asInstanceOf[SchemaNode].schema.schemaRef.packageRef.get.packageId == schemaRef.packageRef.get.packageId
      && i.value.asInstanceOf[SchemaNode].schema.schemaRef.id == schemaRef.id)
        .map(i=> i.value.asInstanceOf[SchemaNode]).toSet

      val result = SemverHelper.findVersion(availibleSchemas, (a: SchemaNode) => a.schema.schemaRef.packageRef.get, schemaRef.packageRef.get.version)
      result.map(_._2)
    }


    def gearsForSchema(schemaRef: SchemaRef) : Set[CompiledLens] = {

      schemaNodeForRef(schemaRef).map(i => {
        knowledgeGraph
          .get(i)
          .edges
          .filter(e => e.isUndirected && e.to != this && e.to.value.isInstanceOf[LensNode])
          .map(i => {
            i.to.value.asInstanceOf[LensNode].gear
          }).toSet
      }).getOrElse(Set())
        .asInstanceOf[Set[CompiledLens]]
    }

    def availableTransformations(schemaRef: SchemaRef) : Set[TransformationChanges] = {
      schemaNodeForRef(schemaRef).map(i => {
        knowledgeGraph
          .get(i)
          .edges
          .filter(e => e.isDirected && e.isLabeled && e.from.value == i && e.label.isInstanceOf[Transformation])
          .map(i => {
            DirectTransformation(i.label.asInstanceOf[Transformation], i.to.value.asInstanceOf[SchemaNode].schema.schemaRef)
          }).toSet
      }).getOrElse(Set())
        .asInstanceOf[Set[TransformationChanges]]
    }

  }
}
