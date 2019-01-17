package com.useoptic.common.spec_types

import com.useoptic.common.spec_types.reporting._
import io.leonard.TraitFormat.{caseObjectFormat, traitFormat}
import play.api.libs.json.Json.format
import play.api.libs.json.{Json, _}

object SpecJSONSerialization {

  implicit val rangeJsonFormats = new Format[Range] {
    override def reads(json: JsValue): JsResult[Range] = {
      JsSuccess(Range(
        (json.as[JsObject] \ "start").get.as[JsNumber].value.toInt,
        (json.as[JsObject] \ "end").get.as[JsNumber].value.toInt
      ))
    }
    override def writes(o: Range): JsValue = {
      JsObject(Seq(
        "start" -> JsNumber(o.start),
        "end" -> JsNumber(o.end)
      ))
    }
  }

  //Api Spec
  implicit val endpointIssueFormat = traitFormat[EndpointIssue] << caseObjectFormat(NoFailureCases) << caseObjectFormat(NoSuccessCases) << format[UnableToParseBody]
  implicit val projectIssueFormat = traitFormat[ProjectIssue] << caseObjectFormat(NoAuthentication) << format[NoObservationsForPath]
  implicit val opticAPIParameterFormats = Json.format[Parameter]
  implicit val opticAPIResponseFormats = Json.format[Response]
  implicit val opticAPIRequestBodyFormats = Json.format[RequestBody]
  implicit val authenticationSchemaFormats = traitFormat[AuthenticationScheme] << caseObjectFormat(HTTPBasic) << caseObjectFormat(HTTPBearer) << format[APIKey]
  implicit val endpointReportFormats = Json.format[EndpointReport]
  implicit val opticAPIEndpointFormats = Json.format[Endpoint]
  implicit val opticAPIServersFormats = Json.format[Servers]
  implicit val opticAPIDescriptionFormats = Json.format[APIDescription]
  implicit val analysisReportFormats = Json.format[AnalysisReport]
  implicit val opticAPISpecFormats = Json.format[OpticAPISpec]
  implicit val opticProjectSnapshotFormats = Json.format[OpticProjectSnapshot]

}
