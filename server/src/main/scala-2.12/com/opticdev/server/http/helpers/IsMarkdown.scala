package com.opticdev.server.http.helpers

import better.files.File

object IsMarkdown {
  def check(file: File) = file.extension(includeDot = false).contains("md")
}
