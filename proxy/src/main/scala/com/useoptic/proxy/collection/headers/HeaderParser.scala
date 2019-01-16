package com.useoptic.proxy.collection.headers

import com.useoptic.common.spec_types.Parameter
import com.useoptic.proxy.collection.jsonschema.JsonSchemaBuilderUtil.basicSchema
object HeaderParser {

  def cleanHeaders(headers: Vector[(String, String)]) =
    headers.filter(headerInstance => !standardHeaders.contains(headerInstance._1))

  def parseHeaders(headers: Vector[(String, String)]) = {
    val cleaned = cleanHeaders(headers)
    cleaned.map(i => Parameter("header", i._1, required = true, basicSchema("string")))
  }

  def mergeHeaders(observedHeaders: Vector[Parameter]*) = {
    val flattened = observedHeaders.flatten.toVector
    val allParams = flattened.map(_.name).distinct
    val groupedByName = flattened.groupBy(_.name)

    val required = groupedByName.collect{ case (name, instances) if instances.size == observedHeaders.size =>  name}

    allParams.map{
      case headerName => Parameter("header", headerName, required.exists(_ == headerName), basicSchema("string"))
    }
  }

  val standardHeaders = Set(
    "A-IM",
    "Accept",
    "Accept-Charset",
    "Accept-Encoding",
    "Accept-Datetime",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
    "Connection",
    "Content-Type",
    "Content-Length",
    "Cookie",
    "Content-MD5",
    "Date",
    "Expect",
    "Expires",
    "ETag",
    "Forwarded",
    "From",
    "Host",
    "If-Match",
    "If-Modified-Since",
    "If-None-Match",
    "If-Range",
    "If-Unmodified-Since",
    "Last-Modified",
    "Location",
    "Max-Forwards",
    "Origin",
    "P3P",
    "Pragma",
    "Set-Cookie",
    "Server",
    "Timeout-Access",
    "Retry-After",
    "Referer",
    "TE",
    "User-Agent",
    "Upgrade",
    "Via",
    "Warning",

    "X-Requested-With",
    "DNT",
    "X-Forwarded-For",
    "X-Forwarded-Host",
    "X-Forwarded-Proto",
    "Front-End-Https",
    "X-Http-Method-Override",
    "X-Powered-By",
    "X-ATT-DeviceId",
    "X-Wap-Profile",
    "Proxy-Connection",
    "X-UIDH",
    "Save-Data",
  )
}
