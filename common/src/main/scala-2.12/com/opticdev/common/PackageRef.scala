package com.opticdev.common

import play.api.libs.json._

import scala.util.Try

case class PackageRef(packageId: String, version: String = "latest") extends Versioned {
  def author = packageId.split(":").head
  def name = packageId.split(":").last
  def full = packageId+"@"+version

  def apply(string: String) = PackageRef.fromString(string).get

}

object PackageRef {

  implicit val packageRefJsonFormat = new Format[PackageRef] {
    override def writes(o: PackageRef) = JsString(o.full)

    override def reads(json: JsValue) = JsSuccess(PackageRef.fromString(json.as[JsString].value).get)
  }

  def fromString(string: String): Try[PackageRef] = Try {
    val components = string.split("@")
    if (components.size > 2) {
      throw new Exception("Invalid Package format")
    }

    val packageId = components.head
    val versionOption = components.lift(1)

    PackageRef(packageId, versionOption.getOrElse("latest"))
  }
}