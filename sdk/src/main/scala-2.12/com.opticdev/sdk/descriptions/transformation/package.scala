package com.opticdev.sdk.descriptions

import com.opticdev.sdk.descriptions.transformation.generate.{GenerateResult, RenderOptions, StagedNode}
import com.opticdev.sdk.descriptions.transformation.mutate.MutateResult
import jdk.nashorn.api.scripting.ScriptObjectMirror

package object transformation {

  trait TransformationResult {
    def yieldsGeneration = this.isInstanceOf[GenerateResult]
    def yieldsMutation = this.isInstanceOf[MutateResult]
  }

  case class DynamicAsk(key: String, description: String, code: ScriptObjectMirror)

}
