package com.useoptic.proxy

import com.useoptic.proxy.collection.url.URLHint

case class OpticAPIConfiguration(name: String,
                                 forwardTo: Option[ProxyConfig],
                                 paths: Vector[URLHint],
                                 excludeHeaders: Vector[String],
                                 includeHeaders: Vector[String])

case class ProxyConfig(host: String, port: Int)