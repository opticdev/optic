package com.opticdev.opm.storage

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.common.storage.DataDirectory
import com.opticdev.opm.{TestPackageProviders, TestProvider}
import org.scalatest.FunSpec


class PackageStorageSpec extends FunSpec with TestPackageProviders {

  describe("Package Storage") {

    it("can save items to local") {
      val packageToSave = t.a
      val saved = PackageStorage.writeToStorage(packageToSave)
      assert(saved.exists)
      assert(saved.pathAsString ==
        (DataDirectory.packages / t.a.author / t.a.name / t.a.version).pathAsString)
    }

    it("can lookup items from local") {
      val packageToSave = t.a
      val saved = PackageStorage.writeToStorage(packageToSave)
      val loadedTry = PackageStorage.loadFromStorage(packageToSave.packageRef)
      assert(loadedTry.isSuccess)
      assert(loadedTry.get == packageToSave)
    }

    it("will not throw when overwriting files") {
      PackageStorage.writeToStorage(t.a)
      PackageStorage.writeToStorage(t.a)
    }

  }

}
