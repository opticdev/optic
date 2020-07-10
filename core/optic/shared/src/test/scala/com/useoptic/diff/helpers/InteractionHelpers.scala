package com.useoptic.diff.helpers

import com.useoptic.types.capture.{ArbitraryData, Body, HttpInteraction, Request, Response}
import io.circe.Json

object InteractionHelpers {
  def simplePut(requestBody: Json, statusCode: Int = 200, contentType: String = "application/json"): HttpInteraction = {
    HttpInteraction(
      "uuid",
      Request(
        "some.host",
        "PUT",
        "/",
        ArbitraryData(None, None, None),
        ArbitraryData(None, None, None),
        Body(Some(contentType), ArbitraryData(None, Some(requestBody.noSpaces), None))
      ),
      Response(
        statusCode,
        ArbitraryData(None, None, None),
        Body(None, ArbitraryData(None, None, None))
      ),
      Vector()
    )
  }

  def simplePost(requestBody: Json, statusCode: Int = 200, contentType: String = "application/json"): HttpInteraction = {
    HttpInteraction(
      "uuid",
      Request(
        "some.host",
        "POST",
        "/",
        ArbitraryData(None, None, None),
        ArbitraryData(None, None, None),
        Body(Some(contentType), ArbitraryData(None, Some(requestBody.noSpaces), None))
      ),
      Response(
        statusCode,
        ArbitraryData(None, None, None),
        Body(None, ArbitraryData(None, None, None))
      ),
      Vector()
    )
  }

  def simpleGet(responseBody: Json, statusCode: Int = 200, contentType: String = "application/json"): HttpInteraction = {
    HttpInteraction(
      "uuid",
      Request(
        "some.host",
        "GET",
        "/",
        ArbitraryData(None, None, None),
        ArbitraryData(None, None, None),
        Body(None, ArbitraryData(None, None, None))
      ),
      Response(
        statusCode,
        ArbitraryData(None, None, None),
        Body(Some(contentType), ArbitraryData(None, Some(responseBody.noSpaces), None))
      ),
      Vector()
    )
  }
}
