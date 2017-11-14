package opm

import com.opticdev.opm.{BatchPackageResult, OpticPackage, PackageRef, Provider}
import com.vdurmont.semver4j.Semver
import com.vdurmont.semver4j.Semver.SemverType

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class TestProvider extends Provider {


  val a = mockPackage("a", "optic", "1.1.1", Seq("optic:b"-> "1.0.0"))

  val b = mockPackage("b", "optic", "1.0.0", Seq("optic:c"-> "3.5.2", "optic:d"-> "2.0.0"))
  val b1 = mockPackage("b", "optic", "1.1.1", Seq("optic:c"-> "2.0.0"))

  val c = mockPackage("c", "optic", "3.5.2", Seq("optic:d"-> "2.0.0"))
  val c1 = mockPackage("c", "optic", "2.0.0", Seq())

  val d = mockPackage("d", "optic", "2.0.0", Seq("optic:e"-> "2.0.0"))

  val e = mockPackage("e", "optic", "2.0.0", Seq("optic:c"-> "2.0.0"))


  val allPackages = Set(a, b, b1, c, c1, d, e)

  override def listInstalledPackages: Vector[OpticPackage] = ???

  override def resolvePackages(packageRefs: PackageRef*): Future[BatchPackageResult] = Future {
    val foundPackages = allPackages.filter(i=> packageRefs.exists(_.packageId == i.packageId))

    val foundVersions = packageRefs.map(i=> {

      val satisfyingVersionOption = foundPackages.filter(p=> {
        p.packageId == i.packageId &&
        new Semver(p.version, SemverType.NPM).satisfies(i.version)
      }).toVector.sortWith((a, b)=> {
        //get highest satisfying version
        new Semver(a.version, SemverType.NPM).isGreaterThan(new Semver(b.version, SemverType.NPM))
      }).headOption

      (i, satisfyingVersionOption)
    }).toMap

    val found = foundVersions.filter(_._2.isDefined).map(_._2.get)
    val notFound = foundVersions.filter(_._2.isEmpty).keys

    BatchPackageResult(found.toSet, notFound.toSet)
  }
}
