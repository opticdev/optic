package com.opticdev.core.sourcegear

import com.opticdev.sdk.descriptions.{Component, Variable}
import com.opticdev.core.sourcegear.graph.model.AstMapping
import com.opticdev.parsers.AstGraph
import gnieh.diffson.playJson.Operation
import play.api.libs.json.JsValue

import scala.util.Try

package object mutate {

  trait Mutation

  case class UpdatedField(component: Component, diffOperation: Operation, mapping: AstMapping, newValue: JsValue)
  case class AstChange(mapping: AstMapping, replacementString: Try[String])

}
