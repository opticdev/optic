package com.useoptic.serialization

import com.useoptic.diff.ApiInteraction
import scala.util.Try

import io.circe._
import io.circe.generic.auto._

object ApiInteractionSerialization {
  def asJson(apiInteraction: ApiInteraction): Json = {
    import io.circe.syntax._
    apiInteraction.asJson
  }

  def fromJson(json: Json): Try[ApiInteraction] = Try {
//    println(json)
    json.as[ApiInteraction].right.get
  }

  // should only work from scala-js/browser context?
  def fromJsonString(json: String) = {
    import io.circe.parser._
//    println(json)
    parse(json)
  }
}

/*

export interface IHeaders {
    [key: string]: string | string[] | undefined
}

export interface IParameterMapping {
    [key: string]: string
}

export interface IMultiParameterMapping {
    [key: string]: string | string[]
}

export interface IRequestMetadata {
    url: string,
    method: string
    headers: IHeaders
    cookies: IParameterMapping
    queryParameters: IMultiParameterMapping
    body?: object
}

export interface IResponseMetadata {
    statusCode: number
    headers: IHeaders
    body?: object | string

}

export interface IApiInteraction {
    request: IRequestMetadata
    response: IResponseMetadata
}
 */
