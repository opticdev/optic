package com.useoptic.common.spec_types.diff

import play.api.libs.json.JsObject

sealed trait ADD extends APISpecChanges {override def isAddition: Boolean = true}
sealed trait REMOVE extends APISpecChanges {override def isRemoval: Boolean = true}
sealed trait UPDATE extends APISpecChanges {override def isUpdate: Boolean = true}

//Spec Level
case class AddedEndpoint(endpointId: String) extends ADD
case class RemovedEndpoint(endpointId: String) extends REMOVE

case class AddedAuthenticationScheme(ofType: String, endpointId: String) extends ADD
case class RemovedAuthenticationScheme(endpointId: String) extends REMOVE

//Endpoint Level

  case class AddedAuthenticationToEndpoint(endpointId: String) extends ADD
  case class RemovedAuthenticationFromEndpoint(endpointId: String) extends REMOVE

  //Body
  case class AddedRequestBody(ofType: String, schema: Option[JsObject], endpointId: String) extends ADD
  case class RemovedRequestBody(endpointId: String) extends REMOVE
  case class UpdatedRequestBodyContentType(newType: String, endpointId: String) extends UPDATE
  case class UpdatedRequestBodySchema(schema: Option[JsObject], endpointId: String) extends UPDATE

  //Parameters
  case class AddedParameter(in: String, name: String, endpointId: String) extends ADD
  case class RemovedParameter(in: String, name: String, endpointId: String) extends REMOVE
  case class UpdatedParameterRequire(in: String, name: String, isRequired: Boolean, endpointId: String) extends UPDATE
  case class UpdatedParameterSchema(in: String, name: String, schema: JsObject, endpointId: String) extends UPDATE

  //Responses
  case class AddedResponse(status: Int, endpointId: String) extends ADD
  case class RemovedResponse(status: Int, endpointId: String) extends REMOVE

  case class UpdatedResponseContentType(status: Int, newType: String, endpointId: String) extends UPDATE
  case class UpdatedResponseSchema(status: Int, schema: Option[JsObject], endpointId: String) extends UPDATE

  case class AddedResponseHeader(status: Int, name: String, endpointId: String) extends ADD
  case class RemovedResponseHeader(status: Int, name: String, endpointId: String) extends REMOVE
  case class UpdatedResponseHeaderRequire(status: Int, name: String, isRequired: Boolean, endpointId: String) extends UPDATE
  case class UpdatedResponseHeaderSchema(status: Int, name: String, schema: JsObject, endpointId: String) extends UPDATE



