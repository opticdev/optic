package com.opticdev.core.sourcegear.graph.model

import com.opticdev.core.sourcegear.gears.helpers.ModelField

object MappingImplicits {

  implicit class SubContainerMatchVector(set: Set[ModelField]) {
    def toMapping: ModelAstMapping =
      set.groupBy(i=> Path(i.propertyPath)).mapValues(_.map(_.astMapping))
      .asInstanceOf[ModelAstMapping]

  }

}
