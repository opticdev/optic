//package com.opticdev.opm
//
//import com.opticdev.common.PackageRef
//import com.opticdev.sdk.descriptions.{Lens, Schema, SchemaRef}
//import play.api.libs.json.{JsArray, JsObject, JsString, JsValue}
//
//import scala.util.Try
//
//case class OpticPackage(packageId: String, contents: JsObject) {
//  val name: String = contents.value("name").as[JsString].value
//  val author: String = contents.value("author").as[JsString].value
//  val version: String = contents.value("version").as[JsString].value
//
//  def packageFull = author+":"+name+"@"+version
//  def packageRef: PackageRef = PackageRef(packageId, version)
//
//  private def objectValueForKey(key: String): Map[String, JsObject] = {
//    val objectValue = contents.value.getOrElse(key, JsObject.empty).as[JsObject]
//    objectValue.value.asInstanceOf[Map[String, JsObject]]
//  }
//
//  lazy val schemas: Map[String, Schema] = objectValueForKey("schemas").map(i=> {
//    i._1 -> Schema.fromJson(SchemaRef(packageRef, i._1), i._2)
//  })
//
//  lazy val lenses: Map[String, Lens] = objectValueForKey("lenses").mapValues(i=> {
//    //@todo this feels a little hacky
//    Lens.fromJson(i ++ JsObject(Seq("packageRef" -> JsString(packageRef.full))))
//  })
//  lazy val objects: Map[String, JsObject] = objectValueForKey("objects")
//
//  lazy val dependencies: Vector[PackageRef] = {
//    val asJsObject: JsObject = contents.value.getOrElse("dependencies", JsObject.empty).as[JsObject]
//    asJsObject.value.map(i=> {
//      PackageRef(i._1, i._2.as[JsString].value)
//    }).toVector
//  }
//}
//
//object OpticPackage {
//  def fromJson(value: JsValue) : Try[OpticPackage] = Try {
//    val jsObject = value.as[JsObject]
//    val name: String = jsObject.value("name").as[JsString].value
//    val author: String = jsObject.value("author").as[JsString].value
//    OpticPackage(author+":"+name, jsObject)
//  }
//}