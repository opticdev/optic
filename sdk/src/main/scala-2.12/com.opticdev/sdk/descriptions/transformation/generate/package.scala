package com.opticdev.sdk.descriptions.transformation

package object generate {
  trait GenerateResult extends TransformationResult {
    def toStagedNode(options: Option[RenderOptions] = None) : StagedNode
  }
}
