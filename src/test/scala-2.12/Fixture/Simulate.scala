package Fixture

import javax.script.ScriptEngineManager

import compiler.Compiler.InsightWriter
import graph.GraphManager
import nashorn.scriptobjects.insights.Insight
import jdk.nashorn.api.scripting.ScriptObjectMirror
import nashorn.NashornParser
import providers.Provider
import sourceparsers.SourceParserManager

object Simulate {

  def fromWriter(insightWriter: InsightWriter, enterOn: String)(implicit provider: Provider) : Insight = {

    val parser = new NashornParser()

    //turn generated parser code into a script object
    val block = parser.getScriptObjectMirror(insightWriter.parserGenerator.generate)

    new Insight(
        "Dummy",
        .1,
        Set(), // Set(insightWriter.lensImpl.template.description.language)
        Option(Vector(enterOn)),
        Option(block),
        None
    )
  }

  def evaluateString(contents: String, lang: String)(implicit provider: Provider) = {

    val template = contents
    val parsed = SourceParserManager.parseString(template, lang)

    val rootNode = parsed._2
    implicit val graph = parsed._1

    val graphManager = new GraphManager

    graphManager.addParsedGraph(graph)
    graphManager.interpretGraph()

    graphManager

  }

}
