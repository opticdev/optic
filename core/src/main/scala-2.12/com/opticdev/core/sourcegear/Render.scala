package com.opticdev.core.sourcegear

import com.opticdev.marvin.common.ast.NewAstNode
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.sdk.descriptions.enums.VariableEnums
import com.opticdev.sdk.descriptions.transformation.{StagedNode, TransformationOptions, VariableMapping}
import play.api.libs.json.JsObject

import scala.util.{Failure, Try}

object Render {

  def fromStagedNode(stagedNode: StagedNode, parentVariableMapping: VariableMapping = Map.empty)(implicit sourceGear: SourceGear) : Try[(NewAstNode, String)] = Try {

    val options = stagedNode.options.getOrElse(TransformationOptions())

    val gearOption = resolveGear(stagedNode)
    assert(gearOption.isDefined, "No gear found that can render this node.")

    val gear = gearOption.get
    val containerContents = options.containers.getOrElse(Map.empty)

    val declaredVariables = gear.parser.variableManager.variables
    val setVariablesMapping = options.variables.getOrElse(Map.empty)
    val parentVariableMappingFiltered = parentVariableMapping.filterNot(v=> declaredVariables.exists(d => d.token == v._1 && d.in == VariableEnums.Self))

    //apply the local mappings onto the parent ones so they can override them.
    val variableMapping = parentVariableMappingFiltered ++ setVariablesMapping

    gear.renderer.renderWithNewAstNode(stagedNode.value, containerContents, variableMapping)
  }

  private def resolveGear(stagedNode: StagedNode)(implicit sourceGear: SourceGear) : Option[Gear] = {
    if (stagedNode.options.isDefined && stagedNode.options.get.gearId.isDefined) {
      val gearId = stagedNode.options.get.gearId.get
      sourceGear.findGear(gearId)
    } else {
      sourceGear.gearSet.listGears.find(_.schemaRef == stagedNode.schema)
    }
  }


  //initializers
  def simpleNode(schemaRef: SchemaRef, value: JsObject, gearIdOption: Option[String] = None)(implicit sourceGear: SourceGear) = {
    fromStagedNode(StagedNode(schemaRef, value, Some(
      TransformationOptions(
        gearId = gearIdOption
      )
    )))
  }

}
