package com.useoptic.proxy

import com.useoptic.proxy.collection.url.URLHint

case class OpticAPIConfiguration(name: String,
                                 test: String,
                                 host: String,
                                 port: Int,
                                 paths: Vector[URLHint],
//                                 excludeHeaders: Vector[String],
//                                 includeHeaders: Vector[String]
                                ) {
}