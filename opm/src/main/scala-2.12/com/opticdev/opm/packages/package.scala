package com.opticdev.opm.packages

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.sdk.MarkdownParser
import play.api.libs.json.{JsObject, JsString, JsValue}

import scala.util.Try

trait OpticPackage {
  val description: JsObject

  val name: String = (description \ "metadata" \ "name").get.as[JsString].value
  val author: String = (description \ "metadata" \ "author").get.as[JsString].value
  val version: String = (description \ "metadata" \ "version").get.as[JsString].value

  def packageId = author+":"+name
  def packageFull = packageId+"@"+version
  def packageRef: PackageRef = PackageRef(packageId, version)

  lazy val dependencies: Vector[PackageRef] = {
    val asJsObject: JsObject = description.value.getOrElse("dependencies", JsObject.empty).as[JsObject]
    asJsObject.value.map(i=> {
      PackageRef(i._1, i._2.as[JsString].value)
    }).toVector
  }

  def resolved(map: Map[PackageRef, PackageRef] = Map()) = OpticMDPackage(description, map)

}

object OpticPackage {

  def fromJson(value: JsValue) : Try[StagedPackage] = Try {
    val jsObject = value.as[JsObject]
    StagedPackage(jsObject)
  }

  def fromMarkdown(file: File) : Try[StagedPackage] = Try {
    //@todo cleanup errors
    val parsedOption = MarkdownParser.parseMarkdown(file)
    if (parsedOption.isSuccess /* && parsedOption.get.noErrors */) {
      StagedPackage(parsedOption.get.description)
    } else {
      throw new Error("Invalid Optic Markdown")
    }
  }

}
