package com.opticdev.opm

import com.opticdev.opm.storage.PackageStorage
import org.scalatest.{BeforeAndAfter, BeforeAndAfterAll, FunSpec, FunSpecLike}


trait TestPackageProviders extends FunSpecLike with BeforeAndAfterAll {
  val t = new TestProvider()

  def installProviders = {
    PackageManager.setProviders(t)
  }

  override def beforeAll(): Unit = {
    PackageStorage.clearLocalPackages
    installProviders
    super.beforeAll()
  }

}
