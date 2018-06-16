package com.opticdev.core.sourcegear.graph.edges

import com.opticdev.core.sourcegear.gears.parsing.{MultiNodeParseGear, ParseGear}
import com.opticdev.parsers.graph.CustomEdge
import com.opticdev.sdk.descriptions.LensRef

case class YieldsModel(withParseGear: ParseGear, root: Boolean = false) extends CustomEdge
case class YieldsMultiNodeModel(lensRef: LensRef) extends CustomEdge
