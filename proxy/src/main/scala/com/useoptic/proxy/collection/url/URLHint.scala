package com.useoptic.proxy.collection.url

import com.useoptic.common.spec_types.Endpoint

import scala.util.Try

case class URLHint(path: String, regex: String, namedParameters: Vector[String]) {
  private val _compiled = regex.r

  lazy val pathParameters = Endpoint.pathParameters(path)

  def matches(fullPath: String): Option[Map[String, String]] = Try {
    val path = if (fullPath.head != '/') "/"+fullPath else fullPath
    _compiled.findFirstMatchIn(path).map(m => {
      namedParameters
        .zipWithIndex
        .map {case (name, index) => (name, m.group(index+1))}
        .toMap
    })
  }.toOption.flatten

}
