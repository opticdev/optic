//package com.useoptic.common.spec_types
//
//import org.scalatest.FunSpec
//import play.api.libs.json.{JsObject, Json}
//
//class ToSwaggerSpec extends FunSpec {
//
//  val endpoints = Vector(
//    Endpoint("get", "/url/:hello/", Vector(
//      Parameter("query", "filter", true, JsObject.empty),
//      Parameter("query", "filterA", true, JsObject.empty),
//      Parameter("query", "filterB", true, JsObject.empty),
//      Parameter("query", "filterC", true, JsObject.empty),
//    ),
//      body = Some(RequestBody("application/json", Some(Json.parse(
//        """
//          |{
//          |					"type": "object",
//          |					"properties": {
//          |						"username": {
//          |							"type": "string",
//          |							"minLength": 3,
//          |							"maxLength": 30
//          |						},
//          |						"password": {
//          |							"type": "string",
//          |							"pattern": "^[a-zA-Z0-9]{3,30}$"
//          |						}
//          |					},
//          |					"additionalProperties": false,
//          |					"patterns": [],
//          |					"required": ["username"]
//          |				}
//        """.stripMargin).as[JsObject]))),
//      responses = Vector(
//        Response(200, Vector(), None, Some(Json.parse("""{
//                                              |					"$schema": "http://json-schema.org/draft-04/schema#",
//                                              |					"title": "",
//                                              |					"type": "object",
//                                              |					"properties": {
//                                              |						"hello": {
//                                              |							"type": "string"
//                                              |						}
//                                              |					}}""".stripMargin).as[JsObject])),
//        Response(410, Vector(), Some("application/json"), Some(Json.parse("""{
//                                                                  |					"$schema": "http://json-schema.org/draft-04/schema#",
//                                                                  |					"title": "",
//                                                                  |					"type": "string"
//                                                                  |					}""".stripMargin).as[JsObject])),
//      ), authentication = Some("MyAuth")),
//    Endpoint("post", "/url/:hello/", Vector(Parameter("header", "X-AUTH", true, JsObject.empty)), responses = Vector(
//      Response(200, Vector(), Some("application/json"), Some(Json.parse("""{
//                                                                |					"$schema": "http://json-schema.org/draft-04/schema#",
//                                                                |					"title": "",
//                                                                |					"type": "string"
//                                                                |					}""".stripMargin).as[JsObject])),
//    )),
//  )
//
//  val auth = Map("MyAuth" -> HTTPBearer)
//
//
//  it("can convert an Optic URL to Swagger URL") {
//    val endpoint = Endpoint("post", "hello/:world.:aidan/:me")
//    val result = OpticAPISpec.urlToSwagger(endpoint.url, endpoint.pathParameters)
//    assert(result == "hello/{world}.{aidan}/{me}")
//  }
//
//  it("can convert an Optic API Spec to Swagger") {
//    val opticSpec = OpticAPISpec(APIDescription(None, None, None), endpoints, auth)
//    assert(opticSpec.toSwagger == Json.parse("""{"openapi":"3.0.0","paths":{"/url/{hello}/":{"get":{"security":{"MyAuth":[]},"requestBody":{"content":{"application/json":{"type":"object","properties":{"username":{"type":"string","minLength":3,"maxLength":30},"password":{"type":"string","pattern":"^[a-zA-Z0-9]{3,30}$"}},"additionalProperties":false,"patterns":[],"required":["username"]}}},"responses":{"200":{"content":{"application/json":{"$schema":"http://json-schema.org/draft-04/schema#","title":"","type":"object","properties":{"hello":{"type":"string"}}}}},"410":{"content":{"application/json":{"$schema":"http://json-schema.org/draft-04/schema#","title":"","type":"string"}}}},"parameters":[{"name":"hello","in":"path","required":true,"schema":{"type":"string"}},{"name":"filter","in":"query","required":true,"schema":{}},{"name":"filterA","in":"query","required":true,"schema":{}},{"name":"filterB","in":"query","required":true,"schema":{}},{"name":"filterC","in":"query","required":true,"schema":{}}]},"post":{"security":{},"responses":{"200":{"content":{"application/json":{"$schema":"http://json-schema.org/draft-04/schema#","title":"","type":"string"}}}},"parameters":[{"name":"hello","in":"path","required":true,"schema":{"type":"string"}},{"name":"X-AUTH","in":"header","required":true,"schema":{}}]}}},"components":{"securitySchemes":{"MyAuth":{"type":"http","scheme":"bearer"}}}}"""))
//  }
//
//}
