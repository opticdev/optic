package com.opticdev.core.sourcegear

import com.opticdev.common.ObjectRef
import com.opticdev.common.SchemaRef
import play.api.libs.json.{JsObject, JsString, JsValue, Json}
import com.opticdev.common.Regexes.packages
import com.opticdev.sdk.descriptions.transformation.TransformationRef

import scala.util.Try
import scala.util.matching.Regex

package object annotations {

  sealed trait Annotation

  //Annotation Value Classes
  sealed trait AnnotationValues {val name: String}
  case class StringValue(name: String) extends AnnotationValues
  case class ExpressionValue(name: String, transformationRef: TransformationRef, askJsonRaw: Option[String]) extends AnnotationValues {
    def askJsObject: Option[JsObject] = askJsonRaw.map(Json.parse).map(_.as[JsObject])
  }

  //Processed Object Annotation Classes
  sealed trait ObjectAnnotation extends Annotation {
    def asString: String
  }
  case class NameAnnotation(name: String, schemaRef: SchemaRef) extends ObjectAnnotation {
    def objectRef = ObjectRef(name)
    def asString = s"""optic.name = "$name""""
  }
  case class SourceAnnotation(projectName: Option[String], sourceName: String, transformationRef: TransformationRef, askObject: Option[JsObject]) extends ObjectAnnotation {
    def asString = s"""optic.source = ${projectName.map("\""+_+"\"").getOrElse("")} "$sourceName" -> ${transformationRef.internalFull} ${askObject.map(_.toString()).getOrElse("")}"""
    def asJson: JsValue = JsString(s"$sourceName")
  }
  case class TagAnnotation(tag: String, schemaRef: SchemaRef) extends ObjectAnnotation {
    def asString = s"""optic.tag = "$tag""""
  }


  //Processed File Annotation Classes
  sealed trait FileAnnotation extends Annotation {
    def asString: String
  }

  case class FileNameAnnotation(name: String) extends FileAnnotation {
    def asString = s"name: $name"
  }


  //Regexes
  def topLevelCapture = "^(\\s*([a-z]+)\\s*:\\s*[a-zA-z \\-\\>\\{\\}\\.\\d\\@\\/\\:\\'\\\"]+)(,\\s*([a-z]+)\\s*:\\s*[a-zA-z \\-\\>\\{\\}\\.\\d\\@\\/\\:\\'\\\"]+)*".r
  def propertiesCapture = s"\\s*([a-z]+)\\s*:\\s*([a-zA-z/\\-:> ]+)".r("key", "name")

  def transformationCapture = s"\\s*([a-z]+)\\s*:\\s*([a-zA-z/\\?:-:?:> ]+)(?:\\s*->\\s*($packages)\\s*(\\{.*\\}){0,1}){0,1}"
    .r("key", "name", "transformRef", "namespace", "packageName", "version", "id", "askJson")
}
