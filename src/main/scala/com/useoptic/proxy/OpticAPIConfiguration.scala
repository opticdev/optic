package com.useoptic.proxy

import com.useoptic.proxy.collection.url.URLHint

case class OpticAPIConfiguration(name: String,
                                 paths: Vector[URLHint],
                                 excludeHeaders: Vector[String],
                                 includeHeaders: Vector[String])
