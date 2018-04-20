package com.opticdev.common

object Regexes {

  val namespace = "^[a-zA-Z][a-zA-Z0-9]{1,34}"
  val packageName = "^[a-zA-Z][a-zA-Z0-9-]{0,34}"
  val packageId = "^[a-zA-Z][a-zA-Z0-9]{1,34}:[a-zA-Z][a-zA-Z0-9-]{0,34}"

}
