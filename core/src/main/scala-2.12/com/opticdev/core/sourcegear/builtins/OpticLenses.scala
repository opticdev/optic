package com.opticdev.core.sourcegear.builtins

import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.core.sourcegear.context.FlatContextBase
import com.opticdev.core.sourcegear.{SGExportableLens, SourceGear}
import com.opticdev.marvin.common.ast.NewAstNode
import com.opticdev.sdk.{ContainersContent, VariableMapping}
import com.opticdev.sdk.descriptions.transformation.generate.StagedNode
import play.api.libs.json.{JsObject, JsString}

import scala.util.Try

object OpticLenses {



  val defaults : Map[SchemaRef, BuiltinLens] = Map(
    SchemaRef(Some(PackageRef("optic:builtins")), "raw") -> new BuiltinLens {
      override def render(value: JsObject, containersContent: ContainersContent, variableMapping: VariableMapping)(implicit sourceGear: SourceGear, context: FlatContextBase): (NewAstNode, String) = {
        val rawValue = value.value("rawText").as[JsString].value
        (NewAstNode("raw", Map(), Some(rawValue)),rawValue)
      }
    }
  )



  def builtinFor(stagedNode: StagedNode) : Option[BuiltinLens] =
    defaults.get(stagedNode.schema)

}
