package com.opticdev.core.utils
import gnieh.diffson.Pointer
import gnieh.diffson.playJson._
import play.api.libs.json.JsValue

object DiffOperationImplicits {

  object DiffTypes extends Enumeration {
    val REPLACE, ADD, DELETE = Value
  }

  implicit class DiffOperation(operation: Operation) {
    //@todo validate nested cases
    def propertyPath : String = operation.path.toString.replaceAll("\\/", ".").substring(1)

    def changeType : DiffTypes.Value = operation match {
      case Add(path: Pointer, value: JsValue) => DiffTypes.ADD
      case Remove(path: Pointer, old: Option[JsValue]) => DiffTypes.DELETE
      case Replace(path: Pointer, value: JsValue, old: Option[JsValue]) => DiffTypes.REPLACE
        //@todo may need to add move and copy support since the lib makes use of those
    }
  }
}
