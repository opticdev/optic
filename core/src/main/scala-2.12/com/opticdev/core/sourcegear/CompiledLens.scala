package com.opticdev.core.sourcegear

import com.opticdev.common.{PackageRef, SGExportable, SchemaRef}
import com.opticdev.core.sourcegear.gears.rendering.RenderGear
import com.opticdev.core.sourcegear.gears.parsing.{ParseAsModel, ParseGear}
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.core.sourcegear.variables.VariableManager
import com.opticdev.core.utils.UUID
import com.opticdev.parsers.{AstGraph, ParserBase}
import com.opticdev.parsers.graph.{AstType, CommonAstNode}
import com.opticdev.sdk.opticmarkdown2.LensRef
import com.opticdev.sdk.opticmarkdown2.schema.OMSchema
import play.api.libs.json.{Format, JsString, JsSuccess, JsValue}

import scala.util.hashing.MurmurHash3
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

import scala.util.Try

case class CompiledLens(name: Option[String],
                        id: String,
                        packageRef: PackageRef,
                        schema: Either[SchemaRef, OMSchema],
                        enterOn: Set[AstType],
                        parser : ParseAsModel,
                        renderer : RenderGear,
                        internal: Boolean = false,
                       ) extends SGExportableLens {

  //@todo make sure this is good enough
  lazy val hash: String = {
    val int = {
      MurmurHash3.stringHash(name.getOrElse("NONE")) ^
      MurmurHash3.stringHash(id) ^
      MurmurHash3.stringHash(packageRef.full) ^
      MurmurHash3.stringHash(schema.toString) ^
      MurmurHash3.setHash(enterOn) ^
      MurmurHash3.stringHash(internal.toString) ^
      parser.hash ^
      parser.hash ^
      renderer.hash
    }

    Integer.toHexString(int)
  }

  override def variableManager: VariableManager = parser.variableManager

  def lensRef : LensRef = LensRef(Some(packageRef), id)

  def matches(entryNode: CommonAstNode)(implicit graph: AstGraph, fileContents: String, sourceGearContext: SGContext, project: Project) =
    parser.matches(entryNode)

  override def schemaRef: SchemaRef = {
    if (schema.isLeft) {
      schema.left.get
    } else {
      schema.right.get.schemaRef
    }
  }
}