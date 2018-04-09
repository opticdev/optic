package com.opticdev.sdk.descriptions

import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.enums.LocationEnums
import com.opticdev.sdk.descriptions.enums.LocationEnums.InContainer
import play.api.libs.json._

import scala.util.Try


object Lens extends Description[Lens] {

  implicit val packageRefReads: Reads[PackageRef] = (json: JsValue) => {
    if (json.isInstanceOf[JsString]) {
      JsSuccess(PackageRef.fromString(json.as[JsString].value).get)
    } else {
      JsError(error = "PackageRef must be a string")
    }
  }

  implicit val lensReads = {
    import Schema._
    import Snippet._
    import Component._
    import Rule._
    import ContainerBase._

    Json.reads[Lens]
  }

  override def fromJson(jsValue: JsValue): Lens = {

    val lens: JsResult[Lens] = Json.fromJson[Lens](jsValue)

    if (lens.isSuccess) {
      lens.get
    } else {
      throw new Error("Lens Parsing Failed "+lens)
    }
  }
}


case class Lens(name: Option[String],
                id: String,
                schema: SchemaRef,
                snippet: Snippet,
                components: Vector[Component],
                variables: Vector[Variable],
                subcontainers: Vector[SubContainer],
                packageRef: PackageRef = PackageRef(null, null)
               ) extends PackageExportable {

  def allSchemaComponents : Vector[SchemaComponent] = {
    val lensComponents = components.filter(_.isInstanceOf[SchemaComponent]).map(i=> i.asInstanceOf[SchemaComponent].withLocation(Location(LocationEnums.InCurrentLens)))
    val containerComponents = subcontainers.flatMap(c=> c.schemaComponents.map(_.withLocation(Location(InContainer(c.name)))))
    lensComponents ++ containerComponents
  }

}

case class LensRef(packageRef: Option[PackageRef], id: String) {
  def full: String = if (packageRef.isEmpty) id else packageRef.get.full+"/"+id
  def internalFull = if (packageRef.isEmpty) id else packageRef.get.packageId+"/"+id
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