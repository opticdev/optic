package com.opticdev.core.Fixture

import better.files.File
import com.opticdev.common.storage.DataDirectory
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph._
import com.opticdev.parsers.utils.Crypto
import org.scalatest.{BeforeAndAfterAll, BeforeAndAfterEach, FunSpec, FunSpecLike}
import play.api.libs.json.{JsObject, JsValue}
import com.opticdev.parsers.SourceParserManager
import com.opticdev.sdk.markdown.MarkdownCache
import org.yaml.snakeyaml.Yaml

import scala.util.{Random, Try}
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import net.jcazevedo.moultingyaml._

trait TestBase extends FunSpecLike with BeforeAndAfterAll {

  def getCurrentDirectory = new java.io.File(".").getCanonicalPath

  val random = new Random()


  def mockCommonAstNode(nT: AstType, v: JsObject, fileHash: String = "SPACE") : CommonAstNode = {
    new CommonAstNode(nT, Range(random.nextInt(6), random.nextInt(6)), v, fileHash) {}
  }

  def start = {
    DataDirectory.init
    DataDirectory.clearCaches
    PreTest.run
    SourceParserManager.clearParsers
    MarkdownCache.clear

    val parserPath = Try({
      val contents = File("config.yaml").contentAsString
      contents.parseYaml.asYamlObject.fields(YamlString("testParser")).asInstanceOf[YamlString].value
    }).getOrElse(throw new Error("No testParser found in config.yaml"))

    SourceParserManager.installParser(parserPath)
  }

  start

  implicit val sourceGearContext = SGContext(null, null, SourceParserManager.installedParsers.head, null, null)

  def resetScratch = PreTest.resetScratch

  override def beforeAll = {
//    DataDirectory.reset
    PreTest.run
    super.beforeAll()
  }

  override def afterAll = {
    PostTest.run
  }

}
