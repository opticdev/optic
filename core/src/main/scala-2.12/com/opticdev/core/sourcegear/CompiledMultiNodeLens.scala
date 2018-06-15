package com.opticdev.core.sourcegear

import com.opticdev.common.{PackageRef, SGExportable}
import com.opticdev.core.sourcegear.gears.parsing.{MultiNodeParseGear, ParseAsModel}
import com.opticdev.core.sourcegear.gears.rendering.{MultiNodeRenderGear, RenderGear}
import com.opticdev.parsers.graph.AstType
import com.opticdev.sdk.descriptions.SchemaRef

case class CompiledMultiNodeLens(name: Option[String],
                                 id: String,
                                 packageRef: PackageRef,
                                 schemaRef: SchemaRef,
                                 enterOn: Set[AstType],
                                 childLenses: Seq[CompiledLens]) extends SGExportable {


  val parser = new MultiNodeParseGear(childLenses, enterOn)
  val renderer = new MultiNodeRenderGear(childLenses)
  val internal: Boolean = false

}
