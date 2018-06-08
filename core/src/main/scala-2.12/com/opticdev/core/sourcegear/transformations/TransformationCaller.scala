package com.opticdev.core.sourcegear.transformations

import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.sdk.descriptions.transformation.{Transformation, TransformationCaller, TransformationRef}
import jdk.nashorn.api.scripting.ScriptObjectMirror

class TransformationCallerImpl(sourceGear: SourceGear) extends TransformationCaller {
  def get(id: String) : ScriptObjectMirror = {
    val transformation = TransformationRef.fromString(id)
    transformation.map(i=> {
      sourceGear.findTransformation(i).get.transformFunction.functionScriptObject.get
    }).getOrElse(null)
  }
}
