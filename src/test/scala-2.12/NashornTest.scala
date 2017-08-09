//DON'T THINK THIS IS USED ANYMORE...CONFIRM


//import Fixture.{PostTest, PreTest, TestBase}
//import TestClasses.{TestAstExtensionManager, TestInsightManager, TestModelManager}
//import jdk.nashorn.api.scripting.{NashornScriptEngineFactory, ScriptObjectMirror}
//import nashorn.{NashornParser, ScriptArray}
//import org.scalatest.{FunSuite, TestSuite}
//import providers.Provider
//import sourceparsers.SourceParserManager
//
//import scala.collection.JavaConverters._
//import scala.collection.convert.Wrappers.MapWrapper
//
//
//class NashornTest extends TestBase {
//  private val engine = new NashornScriptEngineFactory().getScriptEngine("-scripting", "--no-java")
//
//  describe("Script Object Array parity") {
//
//    val vector = Vector("A", "B1", "C", "D")
//    engine.put("test", new ScriptArray[String](vector))
//
//    it("Has length value") {
//      assert(4 == engine.eval("test.length").asInstanceOf[Integer] )
//    }
//
//    it("Supports find function") {
//      assert( null ==  engine.eval("test.find(function (i) { return i == 14 })"))
//      assert( "A"  ==  engine.eval("test.find(function (i) { return i == 'A' })"))
//    }
//
//    it("Supports filter function") {
//      assert(
//        engine.eval("test.filter(function (i) { return i == 'A' })").isInstanceOf[ScriptArray[String]]
//      )
//
//      assert({
//        val result = engine.eval("test.filter(function (i) { return i == 'L' })")
//        result.isInstanceOf[ScriptArray[String]] &&
//          result.asInstanceOf[ScriptArray[String]].vector.size == 0
//      })
//
//    }
//
//    it("Supports map function") {
//      assert(
//        vector.map(_+"BCDE") == engine.eval("test.map(function (i) { return i+'BCDE' })").asInstanceOf[ScriptArray[String]].vector
//      )
//    }
//
//    it("Supports groupBy function") {
//      assert(
//        vector.groupBy(_.length).map(i=> (i._1 -> new ScriptArray(i._2) )) == engine.eval("test.groupBy(function (i) { return i.length })")
//      )
//    }
//
//  }
//
//  describe("Parsing lens, insights, models, etc from JS files") {
//
//    it("Can parse a model") {
//      val output = parser.parse(new java.io.File(getCurrentDirectory + "/src/test/resources/models/modelTest.js"))
//
//      assert(output.models.size == 1)
//
//      val myModel = output.models.head
//
//      TestModelManager.addModel(myModel)
//    }
//
//    it("Can parse a lens") {
//
//      val output2 = parser.parse(new java.io.File(getCurrentDirectory + "/src/test/resources/examples/ExampleLens.js"))
//      assert(output2.lenses.size == 1)
//
//      val thisLens = output2.lenses.head
//
//      assert(thisLens.name == "Using Require")
//      assert(thisLens.allComponents.size == 2)
//    }
//  }
//
//}