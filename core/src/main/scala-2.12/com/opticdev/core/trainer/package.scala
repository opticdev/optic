package com.opticdev.core

import com.opticdev.sdk.descriptions.Component
import play.api.libs.json.JsValue

package object trainer {

  case class ValueCandidate(value: JsValue, previewString: String, stagedComponent: Component) {
    def propertyPath = stagedComponent.propertyPath
  }

}
