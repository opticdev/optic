package com.useoptic.proxy.collection.url

import com.useoptic.common.spec_types.{Parameter, PathParameter}
import io.lemonlabs.uri.Url
import com.useoptic.utils.URLUtils.urlWithoutQueryOrFragment

object URLParser {

  case class ParsedURL(path: String, pathParameters: Vector[PathParameter])

  def parse(url: String, urlHints: Vector[URLHint]): Either[PathMatchException, URLHint] = {
    val uri = urlWithoutQueryOrFragment(Url.parse(url))
    val rootless = uri.path.toRootless.toString()

    val matches = urlHints.filter(_.matches(rootless).isDefined)

    if (matches.size == 1) {
      Right(matches.head)
    } else if (matches.isEmpty) {
      Left(PathMatchException("No Path found in 'optic.yaml' for observed: ", rootless))
    } else {
      Left(PathMatchException(s"Multiple path entries (${matches.map(_.path).mkString(" || ")}) satisfy observed url: ", rootless))
    }
  }

}

case class PathMatchException(message: String, inputURL: String) extends Exception {
  override def getMessage: String = s"${message} '${inputURL}'"
}