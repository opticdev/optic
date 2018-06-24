package com.opticdev.core

import com.opticdev.parsers.graph.AstType
import com.opticdev.sdk.descriptions.enums.BasicComponentType
import com.opticdev.sdk.descriptions.enums.FinderEnums.StringEnums
import com.opticdev.sdk.opticmarkdown2.lens._
import play.api.libs.json._

package object trainer {

  import com.opticdev.sdk.opticmarkdown2.Serialization._

  case class ValueCandidate(value: JsValue, previewString: String, stagedComponent: OMComponentWithPropertyPath[OMLensCodeComponent], schemaField: JsObject) {
    def propertyPath = stagedComponent.propertyPath
  }

  case class ContainerCandidate(name: String, previewString: String, nodeFinder: OMLensNodeFinder)
  case class VariableCandidate(name: String, occurrences: Seq[Range])

  //temp until refactored sdk

  import com.opticdev.common.rangeJsonFormats

  implicit val astTypeFormat = Json.format[AstType]

  implicit val basicComponentTypeFormat = new Format[BasicComponentType] {
    override def reads(json: JsValue): JsResult[BasicComponentType] = ???

    override def writes(o: BasicComponentType): JsValue = {
      JsString(o.getClass.getName)
    }
  }

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
