package com.opticdev.opm
import java.net.URL

import com.opticdev.common.PackageRef
import play.api.libs.json.{JsObject, JsValue, Json}

import scala.concurrent.Future
import scala.util.Try

class OpticRegistryProvider extends RemoteProvider {

  override val baseUrl: URL = new URL("https://registry.opticdev.com/")

//  override def resolvePackage(packageRef: PackageRef): Future[Option[OpticPackage]] = {
//
//    ws.url(baseUrl+"package/"+packageRef.packageId)
//      .withQueryStringParameters(("version", packageRef.version))
//      .get()
//      .map(i=> {
//        println(i)
//        val json = parseJsonResponse(i)
//        Option(OpticPackage(packageRef.packageId, JsObject.empty))
//      })
//
//  }


  def requestEntry(packageRef: PackageRef) : Future[Option[OpticPackage]] = {
    null
  }

  def downloadDescription(url: URL): Future[Option[JsObject]] = {
    null
  }

  override def listInstalledPackages: Vector[OpticPackage] = ???




  //intenral utils
  def parseJsonResponse(response: _root_.play.api.libs.ws.StandaloneWSRequest#Response) : Try[JsValue] = Try {
    Json.parse(response.body)
  }

  override def resolvePackages(packageRef: PackageRef*): Future[BatchPackageResult] = ???
}
