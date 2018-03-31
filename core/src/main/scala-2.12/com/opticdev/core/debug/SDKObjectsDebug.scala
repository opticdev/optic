package com.opticdev.core.debug

import com.opticdev.core.compiler.Compiler.CompileWorker
import com.opticdev.core.compiler.FinderError
import com.opticdev.core.compiler.errors.{CompilerException, ErrorAccumulator}
import com.opticdev.core.compiler.stages.SnippetStage
import com.opticdev.opm.context.{Context, PackageContext}
import com.opticdev.sdk.descriptions._
import play.api.libs.json.{JsObject, JsString, JsValue, Json}

import scala.collection.immutable
import scala.collection.mutable.ListBuffer
import scala.util.{Failure, Success, Try}
import com.opticdev.common.rangeJsonFormats

object LensDebug {

  case class CodeComponentInfo(propertyPath: String, finder: String, error: Option[String] = None)
  case class HighlightComponent(component: CodeComponentInfo, range: Range)
  case class ComponentsInfo(isSuccess: Boolean, found: Seq[HighlightComponent], notFound: Seq[CodeComponentInfo])

  case class HighlightContainer(subContainerName: String, range: Range)
  case class ContainersInfo(isSuccess: Boolean, found: Seq[HighlightContainer], notFound: Seq[String])

  case class VariablesInfo(name: String, ranges: Seq[Range])

  //json formatters
  implicit lazy val snippetFormats = Json.format[Snippet]
  implicit lazy val codeComponentInfoFormats = Json.format[CodeComponentInfo]
  implicit lazy val highlightComponentsFormats = Json.format[HighlightComponent]
  implicit lazy val componentsInfoFormats = Json.format[ComponentsInfo]
  implicit lazy val highlightsContainerFormats = Json.format[HighlightContainer]
  implicit lazy val containersInfoFormats = Json.format[ContainersInfo]
  implicit lazy val variablesInfoFormats = Json.format[VariablesInfo]
  implicit lazy val lensDebugInfoFormats = Json.format[LensDebugInfo]

  case class LensDebugInfo(isSuccess: Boolean,
                           snippet: Snippet,
                           snippetStageError: Option[String],
                           componentsInfo: Option[ComponentsInfo],
                           containersInfo: Option[ContainersInfo],
                           variables: Seq[VariablesInfo],
                           gearId: Option[String]
                          ) extends DebugInfo {

    def toJson : JsValue = Json.toJson[LensDebugInfo](this).as[JsObject] + ("sdkType" -> JsString("lens"))
  }


  def run(lens: Lens, context: Context) = {
    val result = new CompileWorker(lens).compile()(context, debug = true)

    val debugInfo = result.debug.get

    val isSuccess = result.isSuccess

    val snippetStageError = debugInfo.snippetStageOutput match {
      case Success(a) => None
      case Failure(f) => Some(f.asInstanceOf[CompilerException].toString)
    }

    val componentsInfo: Option[ComponentsInfo] = {
      val finderOutputOption = debugInfo.finderStageOutput
      if (finderOutputOption.isSuccess) {
        val finderOutput = finderOutputOption.get

        val foundWithHighlights: Seq[HighlightComponent] = {
          val foundComponents = finderOutput.componentFinders.flatMap(_._2).toVector.distinct.asInstanceOf[Seq[CodeComponent]]
          foundComponents.map(i=> HighlightComponent(CodeComponentInfo(i.toDebugString, i.finder.toDebugString), finderOutput.componentFinders.find(_._2.contains(i)).get._1.targetNode.range))
        }.sortBy(_.range.start)

        Some(ComponentsInfo(!finderOutput.hasErrors, foundWithHighlights, finderOutput.failedFinders.map(f=> {
          CodeComponentInfo(f.codeComponent.toDebugString, f.codeComponent.finder.toDebugString, Some(f.error))
        })))
      } else None
    }

    val containersInfo: Option[ContainersInfo] = {
      debugInfo.snippetStageOutput match {
        case Success(output) => {
          Some(ContainersInfo(
            output.missingContainers.isEmpty,
            output.containerMapping.keys.toSeq.sortBy(_.name).map(i=> HighlightContainer(i.name, i.range)),
            output.missingContainers
          ))
        }
        case _ => None
      }
    }

    val variables: Seq[VariablesInfo] = Try {
      val rules = debugInfo.variableManager.rules(debugInfo.snippetStageOutput.get)
      rules.collect {
        case vr: VariableRule => vr.variableId -> vr.finder.range
      }.groupBy(_._1)
       .map(i=> VariablesInfo(i._1, i._2.map(_._2)))
       .toSeq
       .sortBy(_.name)
    }.getOrElse(Seq())


    LensDebugInfo(
      isSuccess,
      lens.snippet,
      snippetStageError,
      componentsInfo,
      containersInfo,
      variables,
      Try(result.get.id).toOption
    )
  }
}
