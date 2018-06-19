package com.opticdev.core

import com.opticdev.parsers.graph.AstType
import com.opticdev.sdk.descriptions.enums.BasicComponentType
import com.opticdev.sdk.descriptions.enums.FinderEnums.StringEnums
import com.opticdev.sdk.descriptions.finders.{Finder, NodeFinder, RangeFinder, StringFinder}
import com.opticdev.sdk.descriptions.{CodeComponent, Component, SchemaComponent}
import play.api.libs.json._

package object trainer {

  case class ValueCandidate(value: JsValue, previewString: String, stagedComponent: Component) {
    def propertyPath = stagedComponent.propertyPath
  }

  case class ContainerCandidate(name: String, previewString: String, nodeFinder: NodeFinder)
  case class VariableCandidate(name: String, occurrences: Seq[Range])

  //temp until refactored sdk

  import com.opticdev.common.rangeJsonFormats

  implicit val astTypeFormat = Json.format[AstType]
  implicit val nodeFinderFormat = Json.format[NodeFinder]
  implicit val rangeFinderFormat = Json.format[RangeFinder]
  implicit val stringFinderFormat = new Format[StringFinder] {
    override def reads(json: JsValue): JsResult[StringFinder] = ???
    override def writes(o: StringFinder): JsValue = ???
  }
  implicit val finderFormat = Json.format[Finder]

  implicit val basicComponentTypeFormat = new Format[BasicComponentType] {
    override def reads(json: JsValue): JsResult[BasicComponentType] = ???

    override def writes(o: BasicComponentType): JsValue = {
      JsString(o.getClass.getName)
    }
  }
  implicit val codeComponentFormat = Json.format[CodeComponent]
  implicit val schemaComponentFormat = new Format[SchemaComponent] {
    override def reads(json: JsValue): JsResult[SchemaComponent] = ???

    override def writes(o: SchemaComponent): JsValue = ???
  }
  implicit val componentFormat = Json.format[Component]

  implicit val valueCandidateFormats = Json.format[ValueCandidate]
  implicit val containerCandidateFormats = Json.format[ContainerCandidate]
  implicit val variableCandidateFormats = Json.format[VariableCandidate]
  implicit val trainingResultsFormats = Json.format[TrainingResults]

  case class TrainingResults(candidates: Map[String, Seq[ValueCandidate]],
                             keysNotFound: Seq[String],
                             initialValue: JsObject,
                             containerCandidates: Seq[ContainerCandidate],
                             variableCandidates: Seq[VariableCandidate]
                            ) {

    def asJson: JsValue = Json.toJson[TrainingResults](this)

  }

}
