package com.opticdev.common

object Regexes {

  val namespace = "^[a-zA-Z][a-zA-Z0-9]{2,35}"
  val packageName = "^[a-zA-Z][a-zA-Z0-9-]{2,35}"
  val packageId = "^[a-zA-Z][a-zA-Z0-9]{2,35}:[a-zA-Z][a-zA-Z0-9-]{2,35}"

}
