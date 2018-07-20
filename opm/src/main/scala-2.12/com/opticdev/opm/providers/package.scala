package com.opticdev.opm

import java.net.URL

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.opm.packages.{OpticPackage, StagedPackage}
import com.opticdev.parsers.{ParserBase, ParserRef}

import scala.concurrent.Future

package object providers {

  case class ProjectKnowledgeSearchPaths(dirs: File*)

  trait Provider {
    def resolvePackages(packageRefs: PackageRef*) (implicit projectKnowledgeSearchPaths: ProjectKnowledgeSearchPaths, excludeFromCache: Seq[PackageRef]) : Future[BatchPackageResult]
//    def listInstalledPackages (implicit projectKnowledgeSearchPaths: ProjectKnowledgeSearchPaths) : Vector[OpticPackage]

    def resolveParsers(parsers: ParserRef*) : Future[BatchParserResult]
//    def listInstalledParsers : Map[String, Vector[ParserBase]]

    def isCache: Boolean  = false

    def isLocalProvider: Boolean = this.isInstanceOf[LocalProvider]

  }

  trait RemoteProvider extends Provider {
    val baseUrl : String
  }

}
