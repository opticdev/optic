package com.opticdev.core.sourcegear.objects

import com.opticdev.common.ObjectRef
import com.opticdev.sdk.descriptions.SchemaRef
import play.api.libs.json.JsObject

package object annotations {

  sealed trait ObjectAnnotation

  case class NameAnnotation(name: String, schemaRef: SchemaRef) extends ObjectAnnotation {
    def objectRef = ObjectRef(name)
  }

  case class TargetAnnotation(sourceName: String, askObject: JsObject = JsObject.empty) extends ObjectAnnotation

  def topLevelCapture = s"^(\\s*([a-z]+)\\s*:\\s*[a-zA-z ]+[,]{0,1})+".r
  def propertiesCapture = s"\\s*([a-z]+)\\s*:\\s*([a-zA-z ]+)".r


}
