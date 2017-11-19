package com.opticdev.core.sourcegear

import com.opticdev.sdk.descriptions.Component
import com.opticdev.core.sourcegear.graph.model.AstMapping
import gnieh.diffson.playJson.Operation
import play.api.libs.json.JsValue

import scala.util.Try

package object mutate {
  case class UpdatedField(component: Component, diffOperation: Operation, mapping: AstMapping, newValue: JsValue)
  case class AstChange(mapping: AstMapping, replacementString: Try[String])
}
