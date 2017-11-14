package com.opticdev

import java.net.URL

import akka.stream.ActorMaterializer
import play.api.libs.ws.ahc.StandaloneAhcWSClient

import scala.concurrent.Future

package object opm {

  val ws = StandaloneAhcWSClient()(ActorMaterializer())

  case class PackageRef(packageId: String, version: String = "latest") {
    def author = packageId.split(":").head
    def name = packageId.split(":").last
    def full = packageId+"@"+version
  }

  trait Provider {
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



