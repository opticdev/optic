package com.opticdev.sdk.opticmarkdown2

import com.opticdev.parsers.ParserRef

case class OMSnippet(language: String, block: String) {
  def languageId = ParserRef(language)
}
