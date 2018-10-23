package com.opticdev.arrow

import com.opticdev.arrow.changes.ChangeGroup
import com.opticdev.arrow.context.ArrowContextBase
import com.opticdev.core.sourcegear.{CompiledLens, SourceGear}
import play.api.libs.json.{JsArray, JsObject, JsString, JsValue}

package object results {

  trait Result {
    val score : Int
    val context : ArrowContextBase
    require(score >= 0 && score <= 100, "scores must be between 0 & 1")
    def changes : ChangeGroup
    def asJson : JsValue
  }

  case class ModelOption(id: String, value: JsObject, name: String, combinedAsk: JsObject)
}
