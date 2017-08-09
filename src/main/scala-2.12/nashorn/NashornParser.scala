package nashorn

import java.io.{File, FileNotFoundException}
import javax.script.ScriptEngineManager

import nashorn.scriptobjects.accumulators.Accumulator
import cognitro.core.components.models.ModelDefinition
import nashorn.scriptobjects.insights.Insight
import jdk.nashorn.api.scripting.{JSObject, NashornScriptEngineFactory, ScriptObjectMirror}
import compiler.lensparser.{ExampleParser, Finders}
import nashorn.scriptobjects._
import providers.Provider

import scala.collection.JavaConverters._
import scala.io.Source
import collection.JavaConverters._

class NashornParser (implicit val provider: Provider) {

  private val engine = new NashornScriptEngineFactory().getScriptEngine("-scripting", "--no-java")

  //add these on init
  engine.put("Finders", Finders)
  engine.eval("load('"+this.getClass.getClassLoader().getResource("Optic.js")+"')")

  val protectedItems = engine.eval("Object").asInstanceOf[JSObject]
  protectedItems.setMember("LensImpl", LensImpl)
  protectedItems.setMember("Model", ModelDefinition)
  protectedItems.setMember("Group", GroupImpl)
  protectedItems.setMember("Insight", Insight)
  protectedItems.setMember("Accumulator", Accumulator)
  protectedItems.setMember("AstExtensionImpl", AstExtensionImpl)
  protectedItems.setMember("ComponentImpl", ComponentImpl)
  protectedItems.setMember("Provider", provider)
  engine.put("protected", protectedItems)

  val objConstructor = engine.eval("Object").asInstanceOf[JSObject]

  private def generateEvalString(source: String) = {
      "clearAll(); (function(Lens, Finder, Model, Insight, Accumulator, protected, foundExamples, Finders, output) {\n" +
        source +
        "    \n" +
        "})          (Lens, allFinders(), new Model(), new Insight(), new Accumulator(), undefined, undefined, undefined, undefined) \n" +
        "output"
  }

  def getScriptObjectMirror(source: String) : ScriptObjectMirror = {

    val evalString = "clearAll(); (function(Lens, Group, Finder, Model, Insight, protected, foundExamples, Finders, output) {\n" +
      "block = "+ source +
      "    \n" +
      "})          (Lens, Group, allFinders(), new Model(), new Insight(), undefined, undefined, undefined, undefined) \n" +
      "block"

    engine.eval(evalString).asInstanceOf[ScriptObjectMirror]
  }

  def parse(file: File): Output = {

    if (file.exists && file.canRead) {

      val source = Source
        .fromFile(file)
        .getLines()
        .mkString("\n")

      val exampleMatches = ExampleParser.findMatches(source)
      //put this in the top scope
      engine.put("foundExamples", exampleMatches.asJava)

      //to keep the namespace clean
      val evalString = generateEvalString(source)

      try {
        val output = engine.eval(evalString)

        new Output(output.asInstanceOf[ScriptObjectMirror])

      } catch {
        case e: Exception => {
          throw new Exception("Unable to parse file " +e)
        }
      }


    } else {
      throw new FileNotFoundException()
    }

  }

  class Output(scriptObjectMirror: ScriptObjectMirror) {

    var accumulators : Vector[Accumulator] = null
    var lenses : Vector[LensImpl] = null
    var groups : Vector[GroupImpl] = null
    var models : Vector[ModelDefinition] = null
    var insights : Vector[Insight] = null
    var extensions : Vector[AstExtensionImpl] = null

    private def init(scriptObjectMirror: ScriptObjectMirror) = {
      val asScala = scriptObjectMirror.asScala

      lenses = asScala.get("lenses").get.asInstanceOf[ScriptObjectMirror]
        .asScala
        .map(_._2.asInstanceOf[LensImpl])
        .toVector

      accumulators = asScala.get("accumulators").get.asInstanceOf[ScriptObjectMirror]
        .asScala
        .map(_._2.asInstanceOf[Accumulator])
        .toVector

      groups = asScala.get("groups").get.asInstanceOf[ScriptObjectMirror]
        .asScala
        .map(_._2.asInstanceOf[GroupImpl])
        .toVector

      models = asScala.get("models").get.asInstanceOf[ScriptObjectMirror]
        .asScala
        .map(_._2.asInstanceOf[ModelDefinition])
        .toVector


      insights = asScala.get("insights").get.asInstanceOf[ScriptObjectMirror]
        .asScala
        .map(_._2.asInstanceOf[Insight])
        .toVector

      extensions = asScala.get("extensions").get.asInstanceOf[ScriptObjectMirror]
        .asScala
        .map(_._2.asInstanceOf[AstExtensionImpl])
        .toVector

      //@todo Implement dependencies

    }

    init(scriptObjectMirror)

    override def toString : String = {
      val map = Map("lenses" -> lenses,
          "models"-> models,
          "insights"-> insights,
          "extensions"-> extensions).toString()

      map
    }

  }

}
