package com.opticdev.sdk.skills_sdk

import com.opticdev.common.PackageRef
import com.opticdev.sdk.skills_sdk.lens.OMLens
import play.api.libs.json.{Format, JsString, JsSuccess, JsValue}

import scala.util.Try


case class LensRef(packageRef: Option[PackageRef], id: String) {
  def full: String = if (packageRef.isEmpty) id else packageRef.get.full+"/"+id
  def internalFull = if (packageRef.isEmpty) id else packageRef.get.packageId+"/"+id
  def fullyQualified(lens: OMLens) : LensRef = {
    if (packageRef.isEmpty) {
      LensRef(Some(lens.packageRef), id)
    } else this
  }
}

object LensRef {

  implicit val lensRefFormats = new Format[LensRef] {
    import com.opticdev.common.PackageRef.packageRefJsonFormat

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