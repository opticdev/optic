package com.opticdev.opm.providers
import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.opm.packages.OpticPackage
import com.opticdev.opm.{BatchPackageResult, BatchParserResult}
import com.opticdev.parsers.{ParserBase, ParserRef, SourceParserManager}
import com.vdurmont.semver4j.Semver
import com.vdurmont.semver4j.Semver.SemverType

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success, Try}

class LocalProvider extends Provider {

  override def resolvePackages(packageRefs: PackageRef*) (implicit projectKnowledgeSearchPaths: ProjectKnowledgeSearchPaths, excludeFromCache: Seq[PackageRef]) : Future[BatchPackageResult] = Future {

    val foundPackages = listInstalledPackages.filter(i=> packageRefs.exists(_.packageId == i.packageId))

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

  def listInstalledPackages (implicit projectKnowledgeSearchPaths: ProjectKnowledgeSearchPaths) : Vector[OpticPackage] = {
    val allFiles = projectKnowledgeSearchPaths.dirs.flatMap(_.listRecursively)

    val results = allFiles.filter(_.extension.orNull == ".md")
      .map(i => OpticPackage.fromMarkdown(i))
      .toVector

    //print out failing pacakges
    results.collect {
      case Failure(i) => i.printStackTrace()
    }

    val allPackages = results.collect {
      case Success(i) => i
    }

    allPackages
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
    val installedParsers = SourceParserManager.installedParsers.map(i=> (i.languageName, Vector(i))).toMap
    installedParsers
  }

}
