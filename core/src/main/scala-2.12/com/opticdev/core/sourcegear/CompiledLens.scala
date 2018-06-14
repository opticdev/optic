package com.opticdev.core.sourcegear

import com.opticdev.common.{PackageRef, SGExportable}
import com.opticdev.core.sourcegear.gears.rendering.RenderGear
import com.opticdev.core.sourcegear.gears.parsing.{ParseAsModel, ParseGear}
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.core.utils.UUID
import com.opticdev.parsers.{AstGraph, ParserBase}
import com.opticdev.parsers.graph.{AstType, CommonAstNode}
import com.opticdev.sdk.descriptions.{Lens, LensRef, SchemaRef}
import play.api.libs.json.{Format, JsString, JsSuccess, JsValue}

import scala.util.hashing.MurmurHash3
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

import scala.util.Try

case class CompiledLens(name: Option[String],
                        id: String,
                        packageRef: PackageRef,
                        schemaRef: SchemaRef,
                        enterOn: Set[AstType],
                        parser : ParseAsModel,
                        renderer : RenderGear,
                        internal: Boolean = false,
                       ) extends SGExportable {

  //@todo make sure this is good enough
  lazy val hash: String = {
    val int = {
      MurmurHash3.stringHash(name.getOrElse("NONE")) ^
      MurmurHash3.stringHash(id) ^
      MurmurHash3.stringHash(packageRef.full) ^
      MurmurHash3.stringHash(schemaRef.full) ^
      MurmurHash3.setHash(enterOn) ^
      MurmurHash3.stringHash(internal.toString) ^
      parser.hash ^
      parser.hash ^
      renderer.hash
    }

    Integer.toHexString(int)
  }

  def lensRef : LensRef = LensRef(Some(packageRef), id)

  def matches(entryNode: CommonAstNode)(implicit graph: AstGraph, fileContents: String, sourceGearContext: SGContext, project: Project) =
    parser.matches(entryNode)
}