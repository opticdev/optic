package com.opticdev.sdk.skills_sdk

import com.opticdev.common.ParserRef

case class OMSnippet(language: String, block: String) {
  def languageId = ParserRef(language)
}
