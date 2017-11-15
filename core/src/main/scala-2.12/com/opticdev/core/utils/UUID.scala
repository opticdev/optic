package com.opticdev.core.utils

import java.util.{UUID => JavaUUID}

object UUID {
  def generate: String = JavaUUID.randomUUID().toString
}
