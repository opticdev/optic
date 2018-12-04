package com.opticdev.core.sourcegear.graph.model

import com.opticdev.common.SchemaRef
import com.opticdev.core.sourcegear.annotations._
import com.opticdev.core.sourcegear.annotations.dsl.SetOperationNode

case class ModelAnnotations(name: Option[NameAnnotation],
                            tag: Option[TagAnnotation],
                            source: Option[SourceAnnotation],
                            set: Vector[OverrideAnnotation]) {

  def withSchema(schemaRef: SchemaRef): ModelAnnotations = {
    ModelAnnotations(
      name.map(i => NameAnnotation(i.name, schemaRef, i.isBlock)),
      tag.map(i => TagAnnotation(i.tag, schemaRef, i.isBlock)),
      source,
      set
    )
  }

}

object ModelAnnotations {
  def fromVector(vector: Vector[ObjectAnnotation]): ModelAnnotations = {
    ModelAnnotations(
      name   = vector.collectFirst{case na: NameAnnotation => na},
      tag    = vector.collectFirst{case ta: TagAnnotation => ta},
      source = vector.collectFirst{case sa: SourceAnnotation => sa},
      set    = vector.collect{case oa: OverrideAnnotation => oa }
    )
  }

  val empty = ModelAnnotations(None, None, None, Vector.empty)
}