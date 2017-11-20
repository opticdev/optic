package com.opticdev.opm.context

import com.opticdev.opm.OpticPackage
import com.opticdev.sdk.descriptions.{PackageExportable, Schema}

object PackageContextImplicits {
  implicit class PackageContextImplicits(packageContext: PackageContext) {
    def / (packageId: String) = packageContext.get(packageId)
  }

  implicit class OpticPackageImplicits(opticPackage: OpticPackage) {
    def / (id: String): Option[PackageExportable] = {
      val schemaOption = opticPackage.schemas.get(id)
      val lensOption = opticPackage.lenses.get(id)

      if (schemaOption.isDefined) {
        schemaOption.asInstanceOf[Option[PackageExportable]]
      } else if (lensOption.isDefined) {
        lensOption.asInstanceOf[Option[PackageExportable]]
      } else {
        None
      }

    }
  }

}
