package com.opticdev.core.sourcegear

import com.opticdev.common.SchemaRef
import com.opticdev.common.utils.JsonUtils
import com.opticdev.core.sourcegear.annotations.{AnnotationRenderer, TagAnnotation}
import com.opticdev.core.sourcegear.builtins.OpticLenses
import com.opticdev.core.sourcegear.context.FlatContextBase
import com.opticdev.core.sourcegear.gears.helpers.{FlattenModelFields, ModelField}
import com.opticdev.marvin.common.ast.NewAstNode
import com.opticdev.parsers.graph.path.PropertyPathWalker
import com.opticdev.parsers.sourcegear.basic.ObjectLiteralValueFormat
import com.opticdev.sdk.VariableMapping
import com.opticdev.sdk.descriptions.transformation.generate.{RenderOptions, StagedNode}
import com.vdurmont.semver4j.Semver
import play.api.libs.json._

import scala.util.{Failure, Success, Try}
import com.opticdev.core.sourcegear.context.SDKObjectsResolvedImplicits._
import com.opticdev.marvin.common.helpers.LineOperations
import com.opticdev.sdk.opticmarkdown2.LensRef
import com.opticdev.sdk.opticmarkdown2.lens.Self
object Render {

  def fromStagedNode(stagedNode: StagedNode, parentVariableMapping: VariableMapping = Map.empty)(implicit sourceGear: SourceGear, context: FlatContextBase) : Try[(NewAstNode, String, SGExportableLens)] = Try {

    val flatContext: FlatContextBase = if (context == null) sourceGear.flatContext else context

    val options = stagedNode.options.getOrElse(RenderOptions())
    val containerContents = options.containers.getOrElse(Map.empty)


    val builtinOverrides = OpticLenses.builtinFor(stagedNode)
    if (builtinOverrides.isDefined) {
      return Try(builtinOverrides.get.render(stagedNode.value, containerContents, parentVariableMapping)).map(i=> (i._1, i._2, null))
    }

    val gearOption = resolveLens(stagedNode)(sourceGear, flatContext)
    require(gearOption.isDefined, "No gear found that can render this node.")

    val gear = gearOption.get
    val declaredVariables = gear.variableManager.variables
    val setVariablesMapping = options.variables.getOrElse(Map.empty)
    val parentVariableMappingFiltered = parentVariableMapping.filterNot(v=> declaredVariables.exists(d => d.token == v._1 && d.in == Self))

    //apply the local mappings onto the parent ones so they can override them.
    val variableMapping = parentVariableMappingFiltered ++ setVariablesMapping

    val processedValue = processValue(stagedNode)(sourceGear, variableMapping)

    val result = gear.renderer.renderWithNewAstNode(processedValue, containerContents, variableMapping)

    val stringResult = if (options.tag.isDefined) {
      AnnotationRenderer.renderToFirstLine(gear.renderer.parser.inlineCommentPrefix, Vector(TagAnnotation(options.tag.get, gear.schemaRef)), result._2)
    } else {
      result._2
    }

    (result._1.withForcedContent(Some(stringResult)), stringResult, gear)
  }

  def resolveLens(stagedNode: StagedNode)(implicit sourceGear: SourceGear, context: FlatContextBase) : Option[SGExportableLens] = {
    val lensRefTry = Try(LensRef.fromString(stagedNode.options.get.generatorId.get).get)
    if (lensRefTry.isSuccess) {
      val lensRef = lensRefTry.get
      val localOption = Try(context.resolve(lensRef.internalFull).get.asInstanceOf[CompiledLens])
        .toOption
      if (localOption.isDefined) {
        localOption
      } else {
        //transformations should be able to reach outside of their tree
        sourceGear.findLens(lensRef)
      }
    } else {

      val schemaFound = sourceGear.findSchema(stagedNode.schema).flatMap(schema => sourceGear.lensSet.listLenses.find(i=> {
        val lookup = Try(i.resolvedSchema == schema.schemaRef)
        lookup.isSuccess && lookup.get
      }))

      if (schemaFound.isDefined) schemaFound else {
        val lensRef = LensRef(stagedNode.schema.packageRef, stagedNode.schema.id) //look for lenses with internal schemas
        val localOption = Try(context.resolve(lensRef.internalFull).get.asInstanceOf[CompiledLens])
          .toOption
        if (localOption.isDefined) {
          localOption
        } else {
          //transformations should be able to reach outside of their tree
          sourceGear.findLens(lensRef)
        }
      }
    }
  }

  private def processValue(stagedNode: StagedNode)(implicit sourceGear: SourceGear, parentVariableMapping: VariableMapping = Map.empty) : JsObject = {
    val propertyPathWalker = new PropertyPathWalker(stagedNode.value)
    val stagedNodeValues = JsonUtils.filterPaths(
      stagedNode.value,
      (jsValue: JsValue)=> Try(jsValue.as[JsObject].value("_isStagedNode").as[JsBoolean].value).getOrElse(false),
      deep = true
    )

    implicit val flatContext = sourceGear.flatContext

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
  def simpleNode(schemaRef: SchemaRef, value: JsObject, gearIdOption: Option[String] = None, variableMapping: VariableMapping = Map.empty)(implicit sourceGear: SourceGear): Try[(NewAstNode, String, SGExportableLens)] = {
    implicit val flatContext = sourceGear.flatContext
    fromStagedNode(StagedNode(schemaRef, value, Some(
      RenderOptions(
        generatorId = gearIdOption
      )
    )), variableMapping)
  }

}
