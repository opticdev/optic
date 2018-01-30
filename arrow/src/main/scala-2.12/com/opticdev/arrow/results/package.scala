package com.opticdev.arrow

import com.opticdev.core.sourcegear.Gear
import com.opticdev.sdk.descriptions.Schema
import play.api.libs.json.JsValue

package object results {

  trait Result {
    val score : Int
    require(score >= 0 && score <= 100, "scores must be between 0 & 1")
    def asJson : JsValue
  }

}
