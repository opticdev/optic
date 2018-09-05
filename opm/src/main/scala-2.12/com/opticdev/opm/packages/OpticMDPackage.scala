package com.opticdev.opm.packages

import better.files.File
import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.sdk.descriptions._
import play.api.libs.json.{JsArray, JsObject, JsString, JsValue}

import scala.util.Try
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.opticmarkdown2.OMParser
import com.opticdev.sdk.opticmarkdown2.lens.OMLens
import com.opticdev.sdk.opticmarkdown2.schema.OMSchema
case class OpticMDPackage(description: JsObject, dependencyMapping: DependencyMapping) extends OpticPackage {

  lazy val schemas: Vector[OMSchema] = (description \ "schemas").getOrElse(JsArray.empty).as[JsArray].value.map(i=> {
    val schemaObject = i.as[JsObject]
    val id = (schemaObject \ "id").get.as[JsString].value
    val definition = (schemaObject \ "definition").get.as[JsObject]
    OMParser.parseSchema(definition)(SchemaRef(Some(packageRef), id)).get
  }).toVector

  lazy val lenses: Vector[OMLens] = (description \ "lenses").getOrElse(JsArray.empty).as[JsArray].value.map(i=> {
    val lensObject = i.as[JsObject]
    OMParser.parseLens(lensObject)(packageRef).get
  }).toVector

  lazy val transformations: Vector[Transformation] = (description \ "transformations").getOrElse(JsArray.empty).as[JsArray].value.map(i=> {
    val transformationObject = i.as[JsObject]
    Transformation.fromJson(packageRef, transformationObject)
  }).toVector

//  lazy val objects: Map[String, JsObject] = objectValueForKey("objects")

}