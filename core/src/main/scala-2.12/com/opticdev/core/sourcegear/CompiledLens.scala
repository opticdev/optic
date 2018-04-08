package com.opticdev.core.sourcegear

import com.opticdev.common.PackageRef
import com.opticdev.core.sourcegear.gears.rendering.RenderGear
import com.opticdev.core.sourcegear.gears.parsing.{ParseAsModel, ParseGear}
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.core.utils.UUID
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{AstType, CommonAstNode}
import com.opticdev.sdk.descriptions.{Lens, SchemaRef}
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
                        renderer : RenderGear) {

  //@todo make sure this is good enough
  lazy val hash: String = {
    val int = {
      MurmurHash3.stringHash(name.getOrElse("NONE")) ^
      MurmurHash3.stringHash(id) ^
      MurmurHash3.stringHash(packageRef.full) ^
      MurmurHash3.stringHash(schemaRef.full) ^
      MurmurHash3.setHash(enterOn) ^
      parser.hash ^
      renderer.hash
    }

    Integer.toHexString(int)
  }

  def lensRef : LensRef = LensRef(Some(packageRef), id)

  def matches(entryNode: CommonAstNode)(implicit graph: AstGraph, fileContents: String, sourceGearContext: SGContext, project: Project) =
    parser.matches(entryNode)
}


case class LensRef(packageRef: Option[PackageRef], id: String) {
  def full: String = if (packageRef.isEmpty) id else packageRef.get.full+"/"+id
  def fullyQualified(lens: Lens) : LensRef = {
    if (packageRef.isEmpty) {
      LensRef(Some(lens.packageRef), id)
    } else this
  }
}

object LensRef {

  implicit val lensRefFormats = new Format[LensRef] {
    import PackageRef.packageRefJsonFormat

    override def writes(o: LensRef) = JsString(o.full)

    override def reads(json: JsValue) = JsSuccess(LensRef.fromString(json.as[JsString].value).get)
  }


  def fromString(string: String, parentRef: Option[PackageRef] = None): Try[LensRef] = Try {
    val components = string.split("/")

    if (string.isEmpty) throw new Exception("Invalid Lens format")

    if (components.size == 1) {
      LensRef(parentRef, components(0))
    } else if (components.size == 2) {
      val packageId = PackageRef.fromString(components.head)
      val schema = components(1)
      LensRef(Some(packageId.get), schema)
    } else {
      throw new Exception("Invalid Lens format")
    }
  }

  val empty = LensRef(null, null)

}