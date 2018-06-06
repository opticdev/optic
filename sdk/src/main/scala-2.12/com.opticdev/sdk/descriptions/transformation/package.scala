package com.opticdev.sdk.descriptions

import com.opticdev.sdk.descriptions.transformation.generate.{RenderOptions, StagedNode}
import jdk.nashorn.api.scripting.ScriptObjectMirror

package object transformation {

  trait TransformationResult {def toStagedNode(options: Option[RenderOptions] = None) : StagedNode}



  case class DynamicAsk(key: String, description: String, code: ScriptObjectMirror)

}
