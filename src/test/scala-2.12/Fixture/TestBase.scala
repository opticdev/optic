package Fixture

import TestClasses.{TestAccumulatorManager, TestAstExtensionManager, TestInsightManager, TestModelManager}
import cognitro.parsers.GraphUtils.{ModelNode, ModelType, _}
import cognitro.parsers.Utils.Crypto
import compiler.Compiler
import graph.{DependencyHash, GraphManager}
import nashorn.NashornParser
import org.scalatest.{BeforeAndAfterAll, FunSpec, FunSuite, Outcome}
import play.api.libs.json.JsValue
import providers.Provider
import sourceparsers.SourceParserManager
import scalax.collection.edge.Implicits._
import scala.util.Random
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

class TestBase extends FunSpec with BeforeAndAfterAll {

  implicit val provider = Provider(TestModelManager, TestInsightManager, TestAccumulatorManager, TestAstExtensionManager)
  val parser = new NashornParser()

  def installInsight(filePath: String) = {
    provider.modelProvider.addModels(parser.parse(new java.io.File(filePath)).models:_*)
    provider.insightProvider.addInsights(parser.parse(new java.io.File(filePath)).insights:_*)
  }

  def createMockGraph(block: (Graph[BaseNode, LkDiEdge])=> Unit): Graph[BaseNode, LkDiEdge] = {
    val gm = new GraphManager()
    block(gm.getGraph)
    gm.getGraph
  }

  def installInsightFromLens(filePath: String): Unit = {
    val parsed = parser.parse(new java.io.File(filePath))
    val lenses = parsed.lenses
    val models = parsed.models
    provider.modelProvider.addModels(models:_*)
    lenses.foreach(lens=> {
      val result = Compiler.compile(lens)
      val insight = Simulate.fromWriter(result, result.enterOn.name)
      provider.insightProvider.addInsight(insight)
    })
  }

  def clearAllProviders = provider.clearAll

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
    provider.clearAll
  }

  start

  override def beforeAll = {
    start
  }

  override def afterAll = {
    PostTest.run
  }

}
