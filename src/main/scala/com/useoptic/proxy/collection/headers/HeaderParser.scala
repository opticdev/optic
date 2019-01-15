package com.useoptic.proxy.collection.headers

object HeaderParser {

  def cleanHeaders(headers: Map[String, String]) =
    headers.filterKeys(headerKey => !standardHeaders.contains(headerKey))

  val standardHeaders = Set(
    "A-IM",
    "Accept",
    "Accept-Charset",
    "Accept-Encoding",
    "Accept-Datetime",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
    "Connection",
    "Content-Length",
    "Content-MD5",
    "Date",
    "Expect",
    "Expires",
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
    "Server",
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
