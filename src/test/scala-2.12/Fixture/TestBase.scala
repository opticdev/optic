package Fixture

import optic.parsers.GraphUtils._
import optic.parsers.Utils.Crypto
import org.scalatest.{BeforeAndAfterAll, FunSpec}
import play.api.libs.json.JsValue
import sourceparsers.SourceParserManager

import scala.util.Random
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

class TestBase extends FunSpec with BeforeAndAfterAll {

  def parseFile(filePath: String) : Option[ParsedFile] = SourceParserManager.parseFile(new java.io.File(filePath))

  def getCurrentDirectory = new java.io.File(".").getCanonicalPath

  val random = new Random()

  def mockFileNode(fP: String ): InMemoryFileNode = {
    new InMemoryFileNode(fP, random.nextString(15), "Lang", "LangVersion") {
      override val filePath = fP
      override def toString = "MockFile("+fP+")"
    }
  }

  def mockAstPrimitiveNode(nT: AstType, v: JsValue, fileHash: String = "SPACE") : AstPrimitiveNode = {
    new AstPrimitiveNode(nT, (random.nextInt(6), random.nextInt(6)), v, fileHash) {}
  }

  case class MockModelNode(nodeType: ModelType, jsValue: JsValue, dependencyHash: String)(implicit graph: Graph[BaseNode, LkDiEdge]) extends ModelNode {
    override def getValue = jsValue
    override def toString = "MockModelNode ("+nodeType.name+"): "+jsValue
    override def equals(that: Any): Boolean = false
  }

  def mockModelNode(nT: ModelType, v: JsValue, vector: Vector[AstPrimitiveNode])(implicit graph: Graph[BaseNode, LkDiEdge]): MockModelNode = {
    MockModelNode(nT, v,{
      Crypto.createSha1(vector.map(_.fileHash).mkString(""))
    })
  }


  def start = {
    PreTest.run
    SourceParserManager.installParser(System.getProperty("user.home")+"/Developer/knack/parsers/javascript-lang/out/artifacts/javascript_lang_jar/javascript-lang.jar")
  }

  start

  override def beforeAll = {
    start
  }

  override def afterAll = {
    PostTest.run
  }

}
