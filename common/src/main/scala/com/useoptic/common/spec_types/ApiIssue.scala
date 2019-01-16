package com.useoptic.common.spec_types

trait ApiIssue extends SpecIssue

//Endpoint
case class NoResponses(identifier: String,
                       title: String = "Endpoint Validation",
                       message: String = "REST endpoints must have >= 1 response",
                       doctag: String = "issue-endpoint-styles") extends ApiIssue

//Request Body
case class RequestBodyWithoutSchema(identifier: String,
                                    title: String = "Ambiguous Request Body",
                                    message: String = "Request Body schema is ambiguous.",
                                    doctag: String = "issue-ambiguous-request-body") extends ApiIssue

case class RequestBodyWithoutContentType(identifier: String,
                                         title: String = "Request Content Type is ambiguous",
                                         message: String = "Request Body schema is defined, but without a Content-Type.",
                                         doctag: String = "issue-ambiguous-request-type") extends ApiIssue

case class ResponseBodyWithoutSchema(identifier: String,
                                     title: String = "Ambiguous Response Body",
                                     message: String = "Response schema is ambiguous.",
                                     doctag: String = "issue-ambiguous-response-body") extends ApiIssue

case class ResponseBodyWithoutContentType(identifier: String,
                                          title: String = "Response Content Type is ambiguous",
                                          message: String = "Response Body schema is defined, but without a Content-Type.",
                                          doctag: String = "issue-ambiguous-response-type") extends ApiIssue