package com.opticdev

import java.net.URL

import akka.stream.ActorMaterializer
import com.opticdev.common.PackageRef
import com.opticdev.opm.context.Tree
import com.opticdev.parsers.{ParserBase, ParserRef}
import play.api.libs.ws.ahc.StandaloneAhcWSClient

import scala.concurrent.Future

package object opm {

  type DependencyTree = Tree

  //  val ws = StandaloneAhcWSClient()(ActorMaterializer())

  trait Provider {
    def resolvePackages(packageRef: PackageRef*) : Future[BatchPackageResult]
    def listInstalledPackages : Vector[OpticMDPackage]

    def resolveParsers(parsers: ParserRef*) : Future[BatchParserResult]
    def listInstalledParsers : Map[String, Vector[ParserBase]]
  }

  trait RemoteProvider extends Provider {
    val baseUrl : URL
  }

  trait BatchOpmResult[O, R] {
    val found : Set[O]
    val notFound : Set[R]
    def foundAll = notFound.isEmpty
  }

  case class BatchPackageResult(found: Set[OpticMDPackage] = Set(), notFound: Set[PackageRef] = Set())
    extends BatchOpmResult[OpticMDPackage, PackageRef]

  case class BatchParserResult(found: Set[ParserBase] = Set(), notFound: Set[ParserRef] = Set())
    extends BatchOpmResult[ParserBase, ParserRef]

}
