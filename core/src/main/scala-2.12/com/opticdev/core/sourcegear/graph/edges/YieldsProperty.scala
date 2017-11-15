package com.opticdev.core.sourcegear.graph.edges

import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship
import com.opticdev.core.sourcegear.graph.model.Path
import com.opticdev.parsers.graph.CustomEdge

trait YieldsModelProperty extends CustomEdge {
  val path: Path
}

case class YieldsProperty(path: Path, relationship: AstPropertyRelationship.Value) extends YieldsModelProperty
case class YieldsArrayProperty(path: Path, index: Int, relationship: AstPropertyRelationship.Value) extends YieldsModelProperty
