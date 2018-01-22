package com.opticdev.core.sourcegear.graph.model

import com.opticdev.core.sourcegear.gears.helpers.ModelField

object MappingImplicits {

  implicit class SubContainerMatchVector(set: Set[ModelField]) {
    def toMapping: ModelAstMapping = set.map(i=> (Path(i.propertyPath) , i.astMapping)).toMap
  }

}
