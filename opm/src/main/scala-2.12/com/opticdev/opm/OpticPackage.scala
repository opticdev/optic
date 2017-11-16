package com.opticdev.opm

import com.opticdev.common.PackageRef
import play.api.libs.json.{JsObject, JsString}

case class OpticPackage(packageId: String, contents: JsObject) {
  val name = contents.value.get("name").get.asInstanceOf[JsString].value
  val author = contents.value.get("author").get.asInstanceOf[JsString].value
  val version = contents.value.get("version").get.asInstanceOf[JsString].value

  def packageRef = PackageRef(packageId, version)

  lazy val dependencies = {
    val asJsObject: JsObject = contents.value.getOrElse("dependencies", JsObject.empty).as[JsObject]
    asJsObject.value.map(i=> {
      PackageRef(i._1, i._2.as[JsString].value)
    })
  }
}
