package com.useoptic.proxy

import com.useoptic.common.spec_types.AuthenticationScheme
import com.useoptic.proxy.collection.url.URLHint

case class OpticAPIConfiguration(name: String,
                                 test: String,
                                 host: String,
                                 port: Int,
                                 paths: Vector[URLHint],
                                 authentication: Option[AuthenticationScheme],
//                                 excludeHeaders: Option[Vector[String]],
//                                 includeHeaders: Option[Vector[String]]
                                ) {
  def authenticationSchemes: Map[String, AuthenticationScheme] = {
    if (authentication.isDefined) {
      Map("Authentication" -> authentication.get)
    } else {
      Map()
    }
  }
}