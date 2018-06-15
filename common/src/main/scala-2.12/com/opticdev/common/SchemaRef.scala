package com.opticdev.common

import play.api.libs.json.{Format, JsString, JsSuccess, JsValue}

import scala.util.Try

case class SchemaRef(packageRef: Option[PackageRef], id: String) {
  def full: String = if (packageRef.isEmpty) id else packageRef.get.full+"/"+id
  def internalFull = if (packageRef.isEmpty) id else packageRef.get.packageId+"/"+id

  def matchLoose(schemaRef: SchemaRef) = {
    this.packageRef.map(_.packageId) == schemaRef.packageRef.map(_.packageId) &&
      this.id == schemaRef.id
  }
}

object SchemaRef {

  implicit val schemaRefFormats = new Format[SchemaRef] {
    import PackageRef.packageRefJsonFormat

    override def writes(o: SchemaRef) = JsString(o.full)

    override def reads(json: JsValue) = JsSuccess(SchemaRef.fromString(json.as[JsString].value).get)
  }


  def fromString(string: String, parentRef: Option[PackageRef] = None): Try[SchemaRef] = Try {
    val components = string.split("/")

    if (string.isEmpty) throw new Exception("Invalid Schema format")

    if (components.size == 1) {
      SchemaRef(parentRef, components(0))
    } else if (components.size == 2) {
      val packageId = PackageRef.fromString(components.head)
      val schema = components(1)
      SchemaRef(Some(packageId.get), schema)
    } else {
      throw new Exception("Invalid Schema format")
    }
  }

  val empty = SchemaRef(null, null)

}