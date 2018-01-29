package com.opticdev.core.sourcegear

import com.opticdev.core.sourcegear.gears.generating.GenerateGear
import com.opticdev.core.sourcegear.gears.parsing.{ParseAsModel, ParseGear}
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{AstPrimitiveNode, AstType}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class Gear(name: String, enterOn: Set[AstType], parser : ParseAsModel, generater : GenerateGear) {
  def matches(entryNode: AstPrimitiveNode)(implicit graph: AstGraph, fileContents: String, sourceGearContext: SGContext, project: Project) =
    parser.matches(entryNode)
}