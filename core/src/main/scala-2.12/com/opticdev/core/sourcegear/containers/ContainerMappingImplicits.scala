package com.opticdev.core.sourcegear.containers

import com.opticdev.core.sourcegear.gears.helpers.ModelField
import com.opticdev.core.sourcegear.graph.model.{ModelAstMapping, Path}

object ContainerMappingImplicits {

  implicit class ContainerMatchSet(set: Set[SubContainerMatch]) {
    def toMapping: ContainerAstMapping = set.map(i=> (i.subcontainer.name, i.CommonAstNode)).toMap
  }

}
