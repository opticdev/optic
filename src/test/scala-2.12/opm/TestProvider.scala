package opm

import com.opticdev.opm.{BatchPackageResult, OpticPackage, PackageRef, Provider}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class TestProvider extends Provider {


  val a = mockPackage("a", "optic", "1.1.1", Seq("b"-> "1.0.0"))

  val b = mockPackage("b", "optic", "1.0.0", Seq("c"-> "3.5.3", "d"-> "2.0.0"))
  val b1 = mockPackage("b", "optic", "1.1.1", Seq("c"-> "2.0.0"))

  val c = mockPackage("c", "optic", "3.5.2", Seq("d"-> "2.0.0"))
  val c1 = mockPackage("c", "optic", "2.0.0", Seq())

  val d = mockPackage("d", "optic", "2.0.0", Seq("e"-> "2.0.0"))

  val e = mockPackage("e", "optic", "2.0.0", Seq("c"-> "2.0.0"))


  val allPackages = Set(a, b, b1, c, c1, d, e)

  override def resolvePackage(packageRef: PackageRef): Future[Option[OpticPackage]] = Future {
    allPackages.find(i=> i.packageId == packageRef.packageId && i.version == packageRef.version)
  }

  override def listInstalledPackages: Vector[OpticPackage] = ???

  override def resolvePackages(packageRef: PackageRef*): Future[BatchPackageResult] = ???
}
