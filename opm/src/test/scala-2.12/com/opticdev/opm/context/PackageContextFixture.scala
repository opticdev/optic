package com.opticdev.opm.context

import com.opticdev.sdk.descriptions.PackageExportable

case class PackageContextFixture(map: Map[String, PackageExportable]) extends Context {

  def lookup(key: String) = map.get(key)

  def getPackageContext(packageId: String): Option[PackageContext] = ???
  def getDependencyProperty(fullPath: String): Option[PackageExportable] = lookup(fullPath)
  def getProperty(propertyKey: String) : Option[PackageExportable] = lookup(propertyKey)
}
