package com.useoptic.proxy.collection.cookie

import akka.http.scaladsl.model.HttpHeader
import akka.http.scaladsl.model.HttpHeader.ParsingResult.Ok
import akka.http.scaladsl.model.headers.{Cookie, HttpCookie, `Set-Cookie`}
import com.useoptic.common.spec_types.Parameter
import com.useoptic.proxy.collection.jsonschema.JsonSchemaBuilderUtil.basicSchema
import com.useoptic.utils.VectorDistinctBy._

import scala.util.Try

object CookieParser {

  private val cookieHeaders = Set("Set-Cookie", "Cookie")

  def parseHeadersIntoCookies(headers: Vector[(String, String)]): Vector[Parameter] = {
    val cookies = headers
    .collect {
      case (name, value) if cookieHeaders.contains(name) => parseCookie(name, value)
    }

    distinctBy(cookies.collect{ case i if i.isSuccess => i.get}.flatten)(i => i.name)
  }

  def mergeCookies(observedCookies: Vector[Parameter]*) = {
    val flattened = observedCookies.flatten.toVector
    val allParams = flattened.map(_.name).distinct
    val groupedByName = flattened.groupBy(_.name)

    val required = groupedByName.collect{ case (name, instances) if instances.size == observedCookies.size =>  name}

    allParams.map{
      case cookieName => Parameter("cookie", cookieName, required.exists(_ == cookieName), basicSchema("string"))
    }
  }


  def parseCookie(name: String, cookieRaw: String) = Try {

    val cookies = HttpHeader.parse(name, cookieRaw).asInstanceOf[Ok].header match {
      case ck: Cookie => ck.cookies.map(_.name)
      case ck: `Set-Cookie` => Vector(ck.cookie.name)
      case _ => Vector()
    }


    cookies.map(cookie => Parameter("cookie", cookie, true, basicSchema("string")) )
  }

}
