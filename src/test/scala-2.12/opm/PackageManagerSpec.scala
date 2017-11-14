package opm

import com.opticdev.opm.{PackageManager, PackageRef}
import org.scalatest.FunSpec

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

class PackageManagerSpec extends FunSpec {

  describe("Package Manager") {

    val testProvider = new TestProvider()
    PackageManager.setProviders(testProvider)

    it("can change providers") {
      assert(PackageManager.providers.size == 1)
    }

    describe("will install") {

      it("a single package") {
        assert(PackageManager.installPackage(PackageRef("optic:a", "1.1.1")).isDefined)
      }




    }




  }

}
