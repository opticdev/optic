package com.opticdev.arrow

import com.opticdev.arrow.changes.ChangeGroup
import com.opticdev.arrow.context.ArrowContextBase
import com.opticdev.core.sourcegear.{Gear, SourceGear}
import com.opticdev.sdk.descriptions.{Schema, SchemaRef}
import play.api.libs.json.JsValue

package object results {

  trait Result {
    val score : Int
    val context : ArrowContextBase
    require(score >= 0 && score <= 100, "scores must be between 0 & 1")
    def changes : ChangeGroup
    def asJson : JsValue
  }

}
