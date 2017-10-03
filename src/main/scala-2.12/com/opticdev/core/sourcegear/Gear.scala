package com.opticdev.core.sourcegear

import com.opticdev.core.sourcegear.gears.generating.GenerateGear
import com.opticdev.core.sourcegear.gears.parsing.{ParseAsModel, ParseGear}
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{AstPrimitiveNode, AstType}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class Gear(identifier: String, enterOn: Set[AstType], parser : ParseAsModel, generater : GenerateGear) {
  def matches(entryNode: AstPrimitiveNode)(implicit graph: AstGraph, fileContents: String, sourceGearContext: SourceGearContext) =
    parser.matches(entryNode)
}