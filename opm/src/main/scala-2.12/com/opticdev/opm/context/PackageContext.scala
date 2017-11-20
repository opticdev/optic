package com.opticdev.opm.context

import com.opticdev.opm.OpticPackage

class PackageContext(packageMap: PackageMap) {
  def get(packageId: String) : Option[OpticPackage] = packageMap.get(packageId)
}

object PackageContext {
  def fromPackages(packages: OpticPackage*): Unit = {
    
  }
}