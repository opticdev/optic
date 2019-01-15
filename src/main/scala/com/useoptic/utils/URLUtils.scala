package com.useoptic.utils
import io.lemonlabs.uri.Url
object URLUtils {
  def urlWithoutQueryOrFragment(url: Url) : Url = url.withQueryString().withFragment(None)
}
