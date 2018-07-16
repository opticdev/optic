package com.opticdev.core.sourcegear.builtins

import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.context.{FlatContextBase, FlatContextBuilder}
import com.opticdev.marvin.common.ast.NewAstNode
import com.opticdev.sdk.{ContainersContent, VariableMapping}
import play.api.libs.json.JsObject

trait BuiltinLens {
  def render(value: JsObject, containersContent: ContainersContent = Map.empty, variableMapping: VariableMapping = Map.empty)(implicit sourceGear: SourceGear, context: FlatContextBase = FlatContextBuilder.empty): (NewAstNode, String)
}
