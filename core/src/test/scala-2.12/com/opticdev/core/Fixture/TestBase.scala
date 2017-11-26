package com.opticdev.core.Fixture

import com.opticdev.common.storage.DataDirectory
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph._
import com.opticdev.parsers.utils.Crypto
import org.scalatest.{BeforeAndAfterAll, FunSpec, FunSpecLike}
import play.api.libs.json.JsValue
import com.opticdev.parsers.SourceParserManager

import scala.util.Random
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

trait TestBase extends FunSpecLike with BeforeAndAfterAll {

  def getCurrentDirectory = new java.io.File(".").getCanonicalPath

  val random = new Random()


  def mockAstPrimitiveNode(nT: AstType, v: JsValue, fileHash: String = "SPACE") : AstPrimitiveNode = {
    new AstPrimitiveNode(nT, Range(random.nextInt(6), random.nextInt(6)), v, fileHash) {}
  }

  def start = {
    DataDirectory.reset
    PreTest.run
    SourceParserManager.clearParsers
    SourceParserManager.installParser(System.getProperty("user.home")+"/Developer/knack/parsers/javascript-lang/target/scala-2.12/javascript-lang_2.12-1.0.jar")
  }

  start

  implicit val sourceGearContext = SGContext(null, null, SourceParserManager.installedParsers.head, null)

  def resetScratch = PreTest.resetScratch

  override def beforeAll = {
    start
    super.beforeAll()
  }

  override def afterAll = {
    PostTest.run
  }

}
