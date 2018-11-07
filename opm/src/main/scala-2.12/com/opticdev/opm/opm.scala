package com.opticdev

import java.net.URL

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import com.opticdev.common.PackageRef
import com.opticdev.opm.context.Tree
import com.opticdev.opm.packages.{OpticMDPackage, OpticPackage, StagedPackage}
import com.opticdev.opm.providers.OpticRegistryProvider
import com.opticdev.common.ParserRef
import com.opticdev.parsers.ParserBase
import play.api.libs.json.{JsObject, JsString}
import play.api.libs.ws.ahc.StandaloneAhcWSClient

package object opm {

  type DependencyTree = Tree

  implicit val opmActorSystem = ActorSystem("opm")

  //  val ws = StandaloneAhcWSClient()(ActorMaterializer())

  trait BatchOpmResult[O, R] {
    val found : Set[O]
    val notFound : Set[R]
    def foundAll = notFound.isEmpty
  }

  case class BatchPackageResult(found: Set[OpticPackage] = Set(), notFound: Set[PackageRef] = Set())
    extends BatchOpmResult[OpticPackage, PackageRef]

  case class BatchParserResult(found: Set[ParserBase] = Set(), notFound: Set[ParserRef] = Set())
    extends BatchOpmResult[ParserBase, ParserRef]

  def defaultProviderSeq = Seq(
    //local cache should be here somewhere
    new OpticRegistryProvider //then check the remote provider
  )

}
