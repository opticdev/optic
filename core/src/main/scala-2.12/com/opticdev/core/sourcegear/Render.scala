package com.opticdev.core.sourcegear

import com.opticdev.common.utils.JsonUtils
import com.opticdev.core.sourcegear.gears.helpers.{FlattenModelFields, ModelField}
import com.opticdev.marvin.common.ast.NewAstNode
import com.opticdev.parsers.graph.path.PropertyPathWalker
import com.opticdev.parsers.sourcegear.basic.ObjectLiteralValueFormat
import com.opticdev.sdk.{RenderOptions, VariableMapping}
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.sdk.descriptions.enums.VariableEnums
import com.opticdev.sdk.descriptions.transformation.StagedNode
import com.vdurmont.semver4j.Semver
import play.api.libs.json._

import scala.util.{Failure, Success, Try}

object Render {

  def fromStagedNode(stagedNode: StagedNode, parentVariableMapping: VariableMapping = Map.empty)(implicit sourceGear: SourceGear) : Try[(NewAstNode, String, Gear)] = Try {

    val options = stagedNode.options.getOrElse(RenderOptions())

    val gearOption = resolveGear(stagedNode)
    require(gearOption.isDefined, "No gear found that can render this node.")

    val gear = gearOption.get
    val containerContents = options.containers.getOrElse(Map.empty)

    val declaredVariables = gear.parser.variableManager.variables
    val setVariablesMapping = options.variables.getOrElse(Map.empty)
    val parentVariableMappingFiltered = parentVariableMapping.filterNot(v=> declaredVariables.exists(d => d.token == v._1 && d.in == VariableEnums.Self))

    //apply the local mappings onto the parent ones so they can override them.
    val variableMapping = parentVariableMappingFiltered ++ setVariablesMapping

    val processedValue = processValue(stagedNode)(sourceGear, variableMapping)

    val result = gear.renderer.renderWithNewAstNode(processedValue, containerContents, variableMapping)
    (result._1, result._2, gear)
  }

  private def resolveGear(stagedNode: StagedNode)(implicit sourceGear: SourceGear) : Option[Gear] = {
    if (stagedNode.options.isDefined && stagedNode.options.get.gearId.isDefined) {
      val gearId = stagedNode.options.get.gearId.get
      sourceGear.findGear(gearId)
    } else {
      sourceGear.findSchema(stagedNode.schema).flatMap(schema => sourceGear.gearSet.listGears.find(_.schemaRef == schema.schemaRef))
    }
  }

  private def processValue(stagedNode: StagedNode)(implicit sourceGear: SourceGear, parentVariableMapping: VariableMapping = Map.empty) : JsObject = {
    val propertyPathWalker = new PropertyPathWalker(stagedNode.value)
    val stagedNodeValues = JsonUtils.filterPaths(
      stagedNode.value,
      (jsValue: JsValue)=> Try(jsValue.as[JsObject].value("_isStagedNode").as[JsBoolean].value).getOrElse(false),
      deep = true
    )

    val fieldSet = stagedNodeValues.map(i=> Try {
      val obj = propertyPathWalker.getProperty(i).get.as[JsObject]
      val impliedStagedNode = Json.fromJson[StagedNode](obj).get
      val rendered = Render.fromStagedNode(impliedStagedNode, parentVariableMapping)

      val newJsObject = JsObject(Seq(
        "value" -> JsString(rendered.get._2),
        "_valueFormat" -> JsString("code")
      ))
      ModelField(i, newJsObject, null)
    })

    fieldSet.collect { case Failure(a) => println(a) }

    FlattenModelFields.flattenFields(fieldSet.collect { case Success(a) => a }, stagedNode.value)
  }

  //initializers
  def simpleNode(schemaRef: SchemaRef, value: JsObject, gearIdOption: Option[String] = None)(implicit sourceGear: SourceGear) = {
    fromStagedNode(StagedNode(schemaRef, value, Some(
      RenderOptions(
        gearId = gearIdOption
      )
    )))
  }

}
