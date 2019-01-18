package com.useoptic.common.spec_types.diff

import play.api.libs.json.JsObject

sealed trait ADD extends APISpecChanges {override def isAddition: Boolean = true}
sealed trait REMOVE extends APISpecChanges {override def isRemoval: Boolean = true}
sealed trait UPDATE extends APISpecChanges {override def isUpdate: Boolean = true}

//Spec Level
case class AddedEndpoint()(implicit endpointId: String) extends ADD
case class RemovedEndpoint()(implicit endpointId: String) extends REMOVE

case class AddedAuthenticationScheme(ofType: String)(implicit endpointId: String) extends ADD
case class RemovedAuthenticationScheme()(implicit endpointId: String) extends REMOVE

//Endpoint Level

  case class AddedAuthenticationToEndpoint()(implicit endpointId: String) extends ADD
  case class RemovedAuthenticationFromEndpoint()(implicit endpointId: String) extends REMOVE

  //Body
  case class AddedRequestBody(ofType: String, schema: Option[JsObject])(implicit endpointId: String) extends ADD
  case class RemovedRequestBody()(implicit endpointId: String) extends REMOVE
  case class UpdatedRequestBodyContentType(newType: String)(implicit endpointId: String) extends UPDATE
  case class UpdatedRequestBodySchema(schema: Option[JsObject])(implicit endpointId: String) extends UPDATE

  //Parameters
  case class AddedParameter(in: String, name: String)(implicit endpointId: String) extends ADD
  case class RemovedParameter(in: String, name: String)(implicit endpointId: String) extends REMOVE
  case class UpdatedParameterRequire(in: String, name: String, isRequired: Boolean)(implicit endpointId: String) extends UPDATE
  case class UpdatedParameterSchema(in: String, name: String, schema: JsObject)(implicit endpointId: String) extends UPDATE

  //Responses
  case class AddedResponse(status: Int)(implicit endpointId: String) extends ADD
  case class RemovedResponse(status: Int)(implicit endpointId: String) extends REMOVE

  case class UpdatedResponseContentType(status: Int, newType: String)(implicit endpointId: String) extends UPDATE
  case class UpdatedResponseSchema(status: Int, schema: Option[JsObject])(implicit endpointId: String) extends UPDATE

  case class AddedResponseHeader(status: Int, name: String)(implicit endpointId: String) extends ADD
  case class RemovedResponseHeader(status: Int, name: String)(implicit endpointId: String) extends REMOVE
  case class UpdatedResponseHeaderRequire(status: Int, name: String, isRequired: Boolean)(implicit endpointId: String) extends UPDATE
  case class UpdatedResponseHeaderSchema(status: Int, name: String, schema: JsObject)(implicit endpointId: String) extends UPDATE



