package com.opticdev.opm.packages

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.sdk.MarkdownParser
import com.opticdev.sdk.descriptions._
import play.api.libs.json.{JsArray, JsObject, JsString, JsValue}

import scala.util.Try
import com.opticdev.opm.helpers.MDPackageResolveHelper._
case class OpticMDPackage(description: JsObject, dependencyMapping: DependencyMapping) extends OpticPackage{

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
    val lens = Lens.fromJson(lensObject ++ JsObject(Seq("packageRef" -> JsString(packageRef.full))))
    //replace all schemas with full paths
    resolveLens(lens, packageRef, dependencyMapping)
  }).toVector

  lazy val containers: Vector[Container] = (description \ "containers").getOrElse(JsArray.empty).as[JsArray].value.map(i=> {
    val containerObject = i.as[JsObject]
    //this works because all subcontainers come from within a lense.
    ContainerBase.fromJson(containerObject).asInstanceOf[Container]
  }).toVector

  lazy val transformation: Vector[Transformation] = (description \ "transformation").getOrElse(JsArray.empty).as[JsArray].value.map(i=> {
    val transformationObject = i.as[JsObject]
    val transformation = Transformation.fromJson(transformationObject)
    resolveTransformation(transformation, packageRef, dependencyMapping)
  }).toVector


  lazy val objects: Map[String, JsObject] = objectValueForKey("objects")

}