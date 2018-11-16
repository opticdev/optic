package com.opticdev.core.sourcegear.graph.model

import com.opticdev.core.sourcegear.annotations.{NameAnnotation, ObjectAnnotation, SourceAnnotation, TagAnnotation}
import com.opticdev.core.sourcegear.annotations.dsl.SetOperationNode

case class ModelAnnotations(name: Option[NameAnnotation],
                            tag: Option[TagAnnotation],
                            source: Option[SourceAnnotation],
                            set: Vector[SetOperationNode])

object ModelAnnotations {
  def fromVector(vector: Vector[ObjectAnnotation]): ModelAnnotations = {
    ModelAnnotations(
      name   = vector.collectFirst{case na: NameAnnotation => na},
      tag    = vector.collectFirst{case ta: TagAnnotation => ta},
      source = vector.collectFirst{case sa: SourceAnnotation => sa},
      set    = Vector()
    )
  }

  val empty = ModelAnnotations(None, None, None, Vector.empty)
}