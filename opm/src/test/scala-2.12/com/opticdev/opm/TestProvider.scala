package com.opticdev.opm

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.opm.storage.ParserStorage
import com.opticdev.parsers.{ParserRef, SourceParserManager}
import com.vdurmont.semver4j.Semver
import com.vdurmont.semver4j.Semver.SemverType
import play.api.libs.json.{JsObject, JsString, Json}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class TestProvider extends Provider {

  def mockPackage(name: String, author: String, version: String, dependencies: Seq[(String, String)]) = {
    OpticPackage(author+":"+name, JsObject(
      Seq(
        "name"-> JsString(name),
        "version"-> JsString(version),
        "author"-> JsString(author),
        "dependencies" -> JsObject(dependencies.map(i=> i._1 -> JsString(i._2)))
      )
    ))
  }

  val a: OpticPackage = mockPackage("a", "optic", "1.1.1", Seq("optic:b"-> "1.0.0"))

  val b: OpticPackage = mockPackage("b", "optic", "1.0.0", Seq("optic:c"-> "3.5.2", "optic:d"-> "2.0.0"))
  val b1: OpticPackage = mockPackage("b", "optic", "1.1.1", Seq("optic:c"-> "2.0.0"))

  val c: OpticPackage = mockPackage("c", "optic", "3.5.2", Seq("optic:d"-> "2.0.0"))
  val c1: OpticPackage = mockPackage("c", "optic", "2.0.0", Seq())

  val d: OpticPackage = mockPackage("d", "optic", "2.0.0", Seq("optic:e"-> "2.0.0"))

  val e: OpticPackage = mockPackage("e", "optic", "2.0.0", Seq("optic:c"-> "2.0.0"))


  val opticImport: OpticPackage = OpticPackage.fromJson(Json.parse(File(
    "test-examples/resources/example_packages/optic:ImportExample@0.1.0.json").contentAsString)).get


  val opticRest: OpticPackage = OpticPackage.fromJson(Json.parse(File(
    "test-examples/resources/example_packages/express/optic:rest@0.1.0.json").contentAsString)).get

  val opticExpress: OpticPackage = OpticPackage.fromJson(Json.parse(File(
    "test-examples/resources/example_packages/express/optic:express-js@0.1.0.json").contentAsString)).get

  val allPackages = Set(a, b, b1, c, c1, d, e, opticImport, opticRest, opticExpress)

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

  override def resolveParsers(parsers: ParserRef*) : Future[BatchParserResult] = Future {

    val installedParsers = listInstalledParsers

    val parserOptions = parsers.map(ref=> {
      (ref, installedParsers
        .get(ref.packageId).flatMap(versions => {

        val semversions = versions.map(i=> (new Semver(i.parserVersion, SemverType.NPM), i))
          .filter(sV=> sV._1.satisfies(ref.version) || ref.version == "latest")

        semversions.sortWith((a, b)=> {
          a._1.isGreaterThan(b._1)
        }).headOption.map(_._2)
      }))
    })

    val found = parserOptions.filter(_._2.isDefined).map(_._2.get)
    val notFound = parserOptions.filter(_._2.isEmpty).map(_._1)

    BatchParserResult(found.toSet, notFound.toSet)
  }

  override def listInstalledParsers = {
    val js = SourceParserManager.installParser(System.getProperty("user.home")+"/Developer/knack/parsers/javascript-lang/target/scala-2.12/javascript-lang_2.12-1.0.jar")
    Map("Javascript" -> Vector(js.get))
  }
}
