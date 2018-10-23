package com.opticdev.sdk.descriptions

import com.opticdev.sdk.descriptions.transformation.generate.{GenerateResult, RenderOptions, StagedNode}
import com.opticdev.sdk.descriptions.transformation.mutate.MutateResult
import jdk.nashorn.api.scripting.ScriptObjectMirror
import play.api.libs.json.{JsObject, JsValue}

package object transformation {

  trait TransformationResult {
    def yieldsGeneration = this.isInstanceOf[GenerateResult]
    def yieldsMutation = this.isInstanceOf[MutateResult]
    def isMultiTransform = this.isInstanceOf[MultiTransform]

    def jsonPreview: JsValue
  }

  abstract class TransformationCaller {
    def get(id: String): ScriptObjectMirror
  }

  case class DynamicAsk(key: String, description: String, code: ScriptObjectMirror)

}
