package com.opticdev.opm

trait TestPackageProviders {
  val t = new TestProvider()
  PackageManager.setProviders(t)
}
