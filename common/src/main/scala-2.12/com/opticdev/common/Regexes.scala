package com.opticdev.common

object Regexes {

  val namespace = "^[a-z][a-z0-9-]{1,34}"
  val packageName = "^[a-z][a-z0-9-]{0,34}"
  val packageId = "^[a-z][a-z0-9-]{1,34}:[a-z][a-z0-9-]{0,34}"

  val packages = """([a-z][a-z0-9]{1,34}):([a-z][a-z0-9-]{0,34})(?:@(v?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z-]+(?:\.[\da-z-]+)*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?|latest)){0,1}(?:\/([a-z][a-z0-9-]{0,34})){0,1}"""
    .r("namespace", "packageId", "version", "id")
}
