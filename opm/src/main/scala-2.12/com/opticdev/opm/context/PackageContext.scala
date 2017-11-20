package com.opticdev.opm.context

import com.opticdev.common.PackageRef
import com.opticdev.opm.{Leaf, OpticPackage}
import com.opticdev.sdk.descriptions.PackageExportable

case class PackageContext(leaf: Leaf) {

  def getPackageContext(packageId: String): Option[PackageContext] = leaf.tree.leafs.find(_.opticPackage.packageId == packageId).collect {
    case l: Leaf => PackageContext(l)
  }

  def getDependencyProperty(fullPath: String): Option[PackageExportable] = {
    val split = fullPath.split("/")
    if (split.size != 2) throw new Error("Invalid property path. Expects format {author}:{name}/{property} but found "+ fullPath)
    val packageId = PackageRef.fromString(split.head).get.packageId
    val property = split.last

    val packageOption = getPackageContext(packageId)
    if (packageOption.isDefined) {
      packageOption.get.getProperty(property)
    } else None
  }

  def getProperty(propertyKey: String) : Option[PackageExportable] = {
    val schemasOption = leaf.opticPackage.schemas.get(propertyKey)
    val lensOption = leaf.opticPackage.lenses.get(propertyKey)

    if (schemasOption.isDefined) {
      schemasOption.asInstanceOf[Option[PackageExportable]]
    } else if (lensOption.isDefined) {
      lensOption.asInstanceOf[Option[PackageExportable]]
    } else {
      None
    }

  }

}
