package com.opticdev.opm.packages

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.skills_sdk.lens.OMLens
import com.opticdev.sdk.skills_sdk.schema.OMSchema
import play.api.libs.json._

import scala.util.hashing.MurmurHash3
import scala.util.{Success, Try}

trait OpticPackage {
  val name: String
  val author: String
  val version: String

  val schemas: Vector[OMSchema]
  val lenses: Vector[OMLens]
  val transformations: Vector[Transformation]

  def packageId = author+":"+name
  def packageFull = packageId+"@"+version
  def packageRef: PackageRef = PackageRef(packageId, version)

  val dependencies: Vector[PackageRef]

  def resolved(map: Map[PackageRef, PackageRef] = Map()): OpticPackage

  def hash = this.hashCode()
}

trait OpticPackageFromJson extends OpticPackage {
  val description: JsObject

  val name: String = (description \ "info" \ "package").get.as[JsString].value
  val author: String = (description \ "info" \ "author").get.as[JsString].value
  val version: String = (description \ "info" \ "version").get.as[JsString].value


  lazy val dependencies: Vector[PackageRef] = {
    val asJsObject: JsObject = (description \ "info" \ "dependencies" ).getOrElse(JsObject.empty).as[JsObject]
    asJsObject.value
      .collect { case (k:String, v:JsString) => PackageRef.fromString(s"$k@${v.value}")}
      .collect { case Success(i) => i }
      .toVector
  }

  override def hash = MurmurHash3.stringHash(description.toString())

  def resolved(map: Map[PackageRef, PackageRef] = Map()): OpticPackage = OpticMDPackage(description, map)
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
