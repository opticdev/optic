package com.opticdev.opm.providers

import java.net.URL

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.Uri.Query
import akka.http.scaladsl.model._
import akka.http.scaladsl.unmarshalling.Unmarshal
import akka.stream.ActorMaterializer

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}
import com.opticdev.common.{PackageRef, PackageResult, PackageVersion}
import com.opticdev.opm
import com.opticdev.opm.{BatchPackageResult, BatchParserResult, opmActorSystem}
import com.opticdev.opm.packages.{OpticMDPackage, OpticPackage}
import com.opticdev.parsers.{ParserBase, ParserRef}
import play.api.libs.json.{JsArray, JsObject, JsValue, Json}

import scala.concurrent.Future
import scala.concurrent.duration.FiniteDuration
import scala.util.Try
import akka.stream.ActorMaterializer
import com.opticdev.opm.storage.PackageStorage
import com.opticdev.parsers.utils.FileCrypto

import scala.io.Source

class OpticRegistryProvider extends RemoteProvider {
  implicit val materializer = ActorMaterializer()

  implicit val packageVersionFormat = Json.format[PackageVersion]
  implicit val packageResultFormat = Json.format[PackageResult]

//  override val baseUrl: URL = new URL("https://registry.opticdev.com/")
  override val baseUrl: String = s"https://cdmfgxf5e1.execute-api.us-east-2.amazonaws.com/production/packages"

  override def resolvePackages(packageRefs: PackageRef*)(implicit projectKnowledgeSearchPaths: ProjectKnowledgeSearchPaths = ProjectKnowledgeSearchPaths()): Future[BatchPackageResult] = {

    println("Hitting the registry")

    val refStringMapping: Map[PackageRef, String] = packageRefs.map(pr=> (pr, pr.full)).toMap

    val params = Map("packages" -> refStringMapping.values.mkString(","))
    val request = HttpRequest(uri = Uri(baseUrl).withQuery(Query(params)))

    Http().singleRequest(request).map(response=> {

      if (response.status == StatusCode.int2StatusCode(200)) {
        Unmarshal(response.entity).to[String].map(body=> responseToBatchPackageResults(body, refStringMapping))
          .flatten
      } else {
        Future(BatchPackageResult(Set(), packageRefs.toSet))
      }
    }).flatten

  }

  def responseToBatchPackageResults(body: String, refStringMapping: Map[PackageRef, String]) : Future[BatchPackageResult] = Future {
    val asJson =  Json.parse(body).as[JsObject]

    val found = (asJson \ "found").get.as[JsArray].value.map(i=> Json.fromJson[PackageResult](i).get)

    val foundPackageRefs = found.map(i=> i.`for`).toSet
    val notFoundPackageRefs = refStringMapping.filterKeys(r=> !foundPackageRefs.contains(r)).keys.toSet

    //download packages -- assumes all packages are valid
    val downloadFutures = found.map(i=> Future{
      val contents = Source.fromURL(i.satisfiedWith.url).mkString
      require(FileCrypto.sha256Hash(contents) == i.satisfiedWith.hash, s"Hash for ${i.`for`.full} does not match downloaded contents")
      OpticPackage.fromString(contents).get
    })

    Future.sequence(downloadFutures).map(opticPackages=> {
      BatchPackageResult(opticPackages.toSet, notFoundPackageRefs)
    })

  }.flatten


  //@todo properly impliment this when we do parser registry
  override def resolveParsers(parsers: ParserRef*): Future[opm.BatchParserResult] = Future(BatchParserResult(Set(), Set()))

}
