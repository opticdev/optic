package com.opticdev.opm

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.opm.packages.{OpticMDPackage, OpticPackage, StagedPackage}
import com.opticdev.opm.providers.{ProjectKnowledgeSearchPaths, Provider}
import com.opticdev.opm.storage.ParserStorage
import com.opticdev.parsers.{ParserRef, SourceParserManager}
import com.vdurmont.semver4j.Semver
import com.vdurmont.semver4j.Semver.SemverType
import net.jcazevedo.moultingyaml.YamlString
import play.api.libs.json.{JsArray, JsObject, JsString, Json}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

class TestProvider extends Provider {

  def mockPackage(name: String, author: String, version: String, dependencies: Seq[String]) = {
    StagedPackage(JsObject(
      Seq(
        "info" -> JsObject(
          Seq(
            "author"-> JsString(author),
            "package"-> JsString(name),
            "version"-> JsString(version),
            "dependencies" -> JsArray(dependencies.map(JsString))
          ))
      )
    ))
  }

  val a = mockPackage("aaaa", "optic", "1.1.1", Seq("optic:bbbb@1.0.0"))

  val b = mockPackage("bbbb", "optic", "1.0.0", Seq("optic:cccc@3.5.2", "optic:dddd@2.0.0"))
  val b1 = mockPackage("bbbb", "optic", "1.1.1", Seq("optic:cccc@2.0.0"))

  val c = mockPackage("cccc", "optic", "3.5.2", Seq("optic:dddd@2.0.0"))
  val c1 = mockPackage("cccc", "optic", "2.0.0", Seq())

  val d = mockPackage("dddd", "optic", "2.0.0", Seq("optic:eeee@2.0.0"))

  val e = mockPackage("eeee", "optic", "2.0.0", Seq("optic:cccc@2.0.0"))


  val opticImport = OpticPackage.fromJson(Json.parse(File(
    "test-examples/resources/example_packages/optic:ImportExample@0.1.0.json").contentAsString)).get

  val opticRest = OpticPackage.fromJson(Json.parse(File(
    "test-examples/resources/example_packages/express/optic:rest@0.1.0.json").contentAsString)).get

  val opticMongoose = OpticPackage.fromJson(Json.parse(File(
    "test-examples/resources/example_packages/optic:mongoose@0.1.0.json").contentAsString)).get

  val opticExpress = OpticPackage.fromJson(Json.parse(File(
    "test-examples/resources/example_packages/express/optic:express-js@0.1.0.json").contentAsString)).get

  val allPackages = Set(a, b, b1, c, c1, d, e, opticImport, opticRest, opticMongoose, opticExpress)

  override def resolvePackages(packageRefs: PackageRef*) (implicit projectKnowledgeSearchPaths: ProjectKnowledgeSearchPaths = ProjectKnowledgeSearchPaths()): Future[BatchPackageResult] = Future {
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
        .get(ref.languageName).flatMap(versions => {

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

  def listInstalledParsers = {
    import net.jcazevedo.moultingyaml._

    SourceParserManager.clearParsers

    val parserPath = Try({
      val contents = File("config.yml").contentAsString
      contents.parseYaml.asYamlObject.fields(YamlString("testParser")).asInstanceOf[YamlString].value
    }).getOrElse(throw new Error("No testParser found in config.yml"))

    val js = SourceParserManager.installParser(parserPath)

    Map("es7" -> Vector(js.get))
  }
}
