package opm

import better.files.File
import com.opticdev.common.storage.DataDirectory
import com.opticdev.opm.{OpticPackage, PackageRef, PackageStorage}
import org.scalatest.FunSpec


class PackageStorageSpec extends FunSpec {

  val t = new TestProvider

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

    it("can lookup items from local with npm fuzzy version") {
      val packageToSave = t.a
      val saved = PackageStorage.writeToStorage(packageToSave)
      val loadedTry = PackageStorage.loadFromStorage(PackageRef(t.a.packageId, "~1.1.0"))
      assert(loadedTry.isSuccess)
      assert(loadedTry.get == packageToSave)
    }

    it("can lookup items from local with npm fuzzy version when multiple matches are found") {
      val versionOption = PackageStorage.findVersion(
        scala.util.Random.shuffle(Vector(File("1.0.0"), File("1.0.1"), File("1.0.2"), File("1.0.3"))),
        "^1.0.0"
      )

      assert(versionOption.get._1.toString == "1.0.3")
    }

    it("will fail if version doesn't exist") {
      val loadedTry = PackageStorage.loadFromStorage(PackageRef("optic:test", "1.2.2"))
      assert(loadedTry.isFailure)
    }

    it("will list all installed items") {
      PackageStorage.clearLocalPackages
      PackageStorage.writeToStorage(t.a)
      PackageStorage.writeToStorage(t.b)
      PackageStorage.writeToStorage(t.c)

      assert(PackageStorage.installedPackages ==
        Vector("optic:a@1.1.1", "optic:b@1.0.0", "optic:c@3.5.2"))

    }

  }

}
