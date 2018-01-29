package com.opticdev.opm.providers
import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.opm.packages.OpticPackage
import com.opticdev.opm.{BatchPackageResult, BatchParserResult}
import com.opticdev.parsers.{ParserBase, ParserRef}
import com.vdurmont.semver4j.Semver
import com.vdurmont.semver4j.Semver.SemverType

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success, Try}

class LocalProvider extends Provider {

  override def resolvePackages(packageRefs: PackageRef*) (implicit projectKnowledgeSearchPaths: ProjectKnowledgeSearchPaths = ProjectKnowledgeSearchPaths()) : Future[BatchPackageResult] = Future {

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

  override def listInstalledPackages (implicit projectKnowledgeSearchPaths: ProjectKnowledgeSearchPaths = ProjectKnowledgeSearchPaths()) : Vector[OpticPackage] = {
    val allFiles = projectKnowledgeSearchPaths.dirs.flatMap(_.listRecursively)

    allFiles.filter(_.extension.orNull == ".md")
      .map(i => OpticPackage.fromMarkdown(i))
      .toVector
      .collect {
        case Success(i) => i
      }
  }

  override def resolveParsers(parsers: ParserRef*) : Future[BatchParserResult] = Future {
    BatchParserResult(Set(), Set())
  }

  override def listInstalledParsers : Map[String, Vector[ParserBase]] = Map()

}
