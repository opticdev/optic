package com.opticdev.common

object Regexes {

  val namespace = "^[a-z][a-z0-9]{1,34}"
  val packageName = "^[a-z][a-z0-9-]{0,34}"
  val packageId = "^[a-z][a-z0-9]{1,34}:[a-z][a-z0-9-]{0,34}"

}
