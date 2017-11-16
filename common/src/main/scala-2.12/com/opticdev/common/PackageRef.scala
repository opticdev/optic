package com.opticdev.common

import scala.util.Try

case class PackageRef(packageId: String, version: String = "latest") {
  def author = packageId.split(":").head
  def name = packageId.split(":").last
  def full = packageId+"@"+version
}

object PackageRef {
  def fromString(string: String): Try[PackageRef] = Try {
    val components = string.split("@")
    if (components.size > 2) {
      throw new Error("Invalid Package format")
    }

    val packageId = components.head
    val versionOption = components.lift(1)

    PackageRef(packageId, versionOption.getOrElse("latest"))
  }
}