package Fixture



import com.opticdev.core.sourcegear.SourceGearContext
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph._
import com.opticdev.parsers.utils.Crypto
import org.scalatest.{BeforeAndAfterAll, FunSpec, FunSpecLike}
import play.api.libs.json.JsValue
import com.opticdev.core.sourceparsers.SourceParserManager

import scala.util.Random
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

trait TestBase extends FunSpecLike with BeforeAndAfterAll {

  def getCurrentDirectory = new java.io.File(".").getCanonicalPath

  val random = new Random()


  def mockAstPrimitiveNode(nT: AstType, v: JsValue, fileHash: String = "SPACE") : AstPrimitiveNode = {
    new AstPrimitiveNode(nT, Range(random.nextInt(6), random.nextInt(6)), v, fileHash) {}
  }

  case class MockModelNode(nodeType: ModelType, jsValue: JsValue, dependencyHash: String)(implicit graph: AstGraph) extends ModelNode {
    override def getValue = jsValue
    override def toString = "MockModelNode ("+nodeType.name+"): "+jsValue
    override def equals(that: Any): Boolean = false
  }

  def mockModelNode(nT: ModelType, v: JsValue, vector: Vector[AstPrimitiveNode])(implicit graph: AstGraph): MockModelNode = {
    MockModelNode(nT, v,{
      Crypto.createSha1(vector.map(_.fileHash).mkString(""))
    })
  }


  def start = {
    PreTest.run
    SourceParserManager.installParser(System.getProperty("user.home")+"/Developer/knack/parsers/javascript-lang/out/artifacts/javascript_lang_jar/javascript-lang.jar")
  }

  start

  implicit val sourceGearContext = SourceGearContext(null, null, SourceParserManager.getInstalledParsers.head)

  override def beforeAll = {
    start
  }

  override def afterAll = {
    PostTest.run
  }

}
