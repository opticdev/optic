package com.opticdev

import java.net.URL

import akka.stream.ActorMaterializer
import play.api.libs.ws.ahc.StandaloneAhcWSClient

import scala.concurrent.Future

package object opm {

  val ws = StandaloneAhcWSClient()(ActorMaterializer())

  case class PackageRef(packageId: String, version: String = "latest")

  case class SemanticVersion(major: Int, minor: Int, patch: Int) {
    override def toString = Seq(major, minor, patch).mkString(".")
    def compareToString(version: String) = toString == version
  }


  case class OpticPackageEntry(packageId: String, versions: Vector[SemanticVersion] )

  trait Provider {
    def resolvePackage(packageRef: PackageRef) : Future[Option[OpticPackage]]
    def resolvePackages(packageRef: PackageRef*) : Future[BatchPackageResult]
    def listInstalledPackages : Vector[OpticPackage]
  }

  trait RemoteProvider extends Provider {
    val baseUrl : URL
  }

  case class BatchPackageResult(found: Set[OpticPackage] = Set(), notFound: Set[PackageRef] = Set()) {
    def foundAll = notFound.isEmpty
  }

}



