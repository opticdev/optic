package com.opticdev.arrow

import com.opticdev.arrow.changes.ChangeGroup
import com.opticdev.arrow.context.ArrowContextBase
import com.opticdev.core.sourcegear.{Gear, SourceGear}
import com.opticdev.sdk.descriptions.{Schema, SchemaRef}
import play.api.libs.json.{JsArray, JsObject, JsString, JsValue}

package object results {

  trait Result {
    val score : Int
    val context : ArrowContextBase
    require(score >= 0 && score <= 100, "scores must be between 0 & 1")
    def changes : ChangeGroup
    def asJson : JsValue
  }

  case class ModelOption(id: String, value: JsObject, name: String)
  object ModelOption {
    def nameFromValue(schemaId: String, value: JsObject): String = {

      val asStrings = value.fields.sortBy(_._1).map(i=> {
        val stringValue = i._2 match {
          case o: JsObject => s"{${o.fields.size} fields}"
          case a: JsArray => s"{${a.value.size} items}"
          case a: JsValue => a.toString()
        }
        s"${i._1}: ${stringValue}"
      })

      s"${schemaId}(${asStrings.mkString(", ")})"
    }
  }
}
