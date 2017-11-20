package com.opticdev.opm.context

import com.opticdev.sdk.descriptions.PackageExportable

trait Context {
  def getPackageContext(packageId: String): Option[PackageContext]
  def getDependencyProperty(fullPath: String): Option[PackageExportable]
  def getProperty(propertyKey: String) : Option[PackageExportable]

  def apply(fullId: String) : Option[PackageExportable] = {

    val leafPropertyOption = getProperty(fullId)
    val dependenciesPropertyOption = getDependencyProperty(fullId)

    if (leafPropertyOption.isDefined) {
      leafPropertyOption
    } else if (dependenciesPropertyOption.isDefined) {
      dependenciesPropertyOption
    } else {
      None
    }
  }

}
