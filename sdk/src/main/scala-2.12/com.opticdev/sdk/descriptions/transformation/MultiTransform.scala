package com.opticdev.sdk.descriptions.transformation

import com.opticdev.sdk.descriptions.transformation.generate.GenerateResult
import com.opticdev.sdk.descriptions.transformation.mutate.MutateResult

case class MultiTransform(transforms: Seq[TransformationResult]) extends TransformationResult
