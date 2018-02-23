package com.opticdev.core.sourcegear

import com.opticdev.core.sourcegear.gears.generating.GenerateGear
import com.opticdev.core.sourcegear.gears.parsing.{ParseAsModel, ParseGear}
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.core.utils.UUID
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{CommonAstNode, AstType}
import com.opticdev.sdk.descriptions.SchemaRef

import scala.util.hashing.MurmurHash3
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class Gear(name: String, packageFull: String, schemaRef: SchemaRef, enterOn: Set[AstType], parser : ParseAsModel, generater : GenerateGear) {
  //@todo make sure this is good enough
  def id = {
    val int = {
      MurmurHash3.stringHash(name) ^
      MurmurHash3.stringHash(packageFull) ^
      MurmurHash3.stringHash(schemaRef.full) ^
      MurmurHash3.setHash(enterOn) ^
      parser.hash ^
      generater.hash
    }

    Integer.toHexString(int)
  }

  def matches(entryNode: CommonAstNode)(implicit graph: AstGraph, fileContents: String, sourceGearContext: SGContext, project: Project) =
    parser.matches(entryNode)
}