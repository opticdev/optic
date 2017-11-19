package com.opticdev.common

case class ParserRef(packageId: String, version: String = "latest") {
  def full = packageId+"@"+version
}
