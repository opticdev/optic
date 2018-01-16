package com.opticdev.opm

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.sdk.MarkdownParser
import com.opticdev.sdk.descriptions._
import play.api.libs.json.{JsArray, JsObject, JsString, JsValue}

import scala.util.Try

case class OpticMDPackage(description: JsObject) {

  val name: String = (description \ "metadata" \ "name").get.as[JsString].value
  val author: String = (description \ "metadata" \ "author").get.as[JsString].value
  val version: String = (description \ "metadata" \ "version").get.as[JsString].value

  def packageId = author+":"+name
  def packageFull = packageId+"@"+version
  def packageRef: PackageRef = PackageRef(packageId, version)

  private def objectValueForKey(key: String): Map[String, JsObject] = {
    val objectValue = description.value.getOrElse(key, JsObject.empty).as[JsObject]
    objectValue.value.asInstanceOf[Map[String, JsObject]]
  }

  lazy val schemas: IndexedSeq[Schema] = (description \ "schemas").getOrElse(JsArray.empty).as[JsArray].value.map(i=> {
    val schemaObject = i.as[JsObject]
    val id = (schemaObject \ "id").get.as[JsString].value
    val definition = (schemaObject \ "definition").get.as[JsObject]
    Schema.fromJson(SchemaRef(packageRef, id), definition)
  }).toVector

  lazy val lenses: Vector[Lens] = (description \ "lenses").getOrElse(JsArray.empty).as[JsArray].value.map(i=> {
    val lensObject = i.as[JsObject]
    //@todo this feels a little hacky
    Lens.fromJson(lensObject ++ JsObject(Seq("packageRef" -> JsString(packageRef.full))))
  }).toVector

  lazy val containers: Vector[Container] = (description \ "containers").getOrElse(JsArray.empty).as[JsArray].value.map(i=> {
    val containerObject = i.as[JsObject]
    //this works because all subcontainers come from within a lense.
    ContainerBase.fromJson(containerObject).asInstanceOf[Container]
  }).toVector

  lazy val objects: Map[String, JsObject] = objectValueForKey("objects")

  lazy val dependencies: Vector[PackageRef] = {
    val asJsObject: JsObject = description.value.getOrElse("dependencies", JsObject.empty).as[JsObject]
    asJsObject.value.map(i=> {
      PackageRef(i._1, i._2.as[JsString].value)
    }).toVector
  }
}

object OpticMDPackage {
  def fromJson(value: JsValue) : Try[OpticMDPackage] = Try {
    val jsObject = value.as[JsObject]
    OpticMDPackage(jsObject)
  }

  def fromMarkdown(file: File) : Try[OpticMDPackage] = Try {
    //@todo cleanup errors
    val parsedOption = MarkdownParser.parseMarkdown(file)
    if (parsedOption.isSuccess /* && parsedOption.get.noErrors */) {
      OpticMDPackage(parsedOption.get.description)
    } else {
      throw new Error("Invalid Optic Markdown")
    }
  }

}
