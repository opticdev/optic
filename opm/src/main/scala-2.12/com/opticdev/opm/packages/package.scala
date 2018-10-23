package com.opticdev.opm.packages

import better.files.File
import com.opticdev.common.PackageRef
import play.api.libs.json._

import scala.util.{Success, Try}

trait OpticPackage {
  val description: JsObject

  val name: String = (description \ "info" \ "package").get.as[JsString].value
  val author: String = (description \ "info" \ "author").get.as[JsString].value
  val version: String = (description \ "info" \ "version").get.as[JsString].value

  def packageId = author+":"+name
  def packageFull = packageId+"@"+version
  def packageRef: PackageRef = PackageRef(packageId, version)

  lazy val dependencies: Vector[PackageRef] = {
    val asJsObject: JsObject = (description \ "info" \ "dependencies" ).getOrElse(JsObject.empty).as[JsObject]
    asJsObject.value
      .collect { case (k:String, v:JsString) => PackageRef.fromString(s"$k@${v.value}")}
      .collect { case Success(i) => i }
      .toVector
  }

  def resolved(map: Map[PackageRef, PackageRef] = Map()) = OpticMDPackage(description, map)

}

object OpticPackage {

  def fromJson(value: JsValue) : Try[StagedPackage] = Try {
    val jsObject = value.as[JsObject]
    StagedPackage(jsObject)
  }

  def fromString(string: String) : Try[StagedPackage] = Try {
    val jsObject = Json.parse(string).as[JsObject]
    StagedPackage(jsObject)
  }

}
