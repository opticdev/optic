package nashorn.scriptobjects.insights

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode}
import cognitro.core.components.models.ModelInstance
import cognitro.core.nashorn.SafetyClass
import graph.AstNodeWrapper
import jdk.nashorn.api.scripting.{JSObject, ScriptObjectMirror}
import nashorn.ScriptObjectUtils
import nashorn.scriptobjects.{ParserReturn, SharedStore}
import nashorn.scriptobjects.accumulators.Accumulator
import play.api.libs.json.{JsObject, JsValue}
import providers.Provider

import scala.collection.JavaConverters._
import scala.collection.mutable

case class Insight(name: String,
                   version: Double,
                   languages: Set[LanguageSupport],
                   enterOn: Option[Vector[String]],
                   parser: Option[ScriptObjectMirror],
                   writer: Option[ScriptObjectMirror])(implicit val provider: Provider){

  def evaluateNode(node: AstNodeWrapper, sharedStore: SharedStore = new SharedStore): Set[InsightParserReturn] = {
    if (parser.isDefined) {
      val loadedParser = parser.get

      //@todo make this async
      val returnArray = loadedParser.call(this, node.jsWrapper(false), sharedStore).asInstanceOf[ScriptObjectMirror]

      if (returnArray == null) return Set()

      returnArray.asScala.map(i=> {

        val returnValue = i._2.asInstanceOf[ScriptObjectMirror]

        if (returnValue.hasMember("model") && returnValue.hasMember("dependencies") &&
          returnValue.get("model").isInstanceOf[ModelInstance]) {

          val modelInstance = returnValue.get("model").asInstanceOf[ModelInstance]
          val dependencies: Map[String, AstPrimitiveNode] =
            returnValue.get("dependencies").asInstanceOf[ScriptObjectMirror].asScala
              .map(i=> {
                val safeNodeGetter = i._2.asInstanceOf[JSObject].getMember("asScalaNode").asInstanceOf[(SafetyClass) => AstNodeWrapper]

                (i._1, safeNodeGetter(SafetyClass()).node)
              }).toMap

          InsightParserReturn(modelInstance, dependencies, this)

        } else null

      }).toSet

    } else Set()
  }

  def write(jsValue: JsValue, dependents: Map[String, AstNodeWrapper]) : Boolean = {

    if (writer.isDefined) {
      val loadedWriter = writer.get
      val dependentsForJS = dependents.map(i=> {
        (i._1, i._2.jsWrapper(true))
      }).asJava
                                                        //@todo fix this, let anything valid...work
      val jsObject = ScriptObjectUtils.jsObjectToScriptObject(jsValue.asInstanceOf[JsObject])
      loadedWriter.call(null, jsObject, dependentsForJS)
      true
    } else false
  }

}

object Insight {
  def define(params: ScriptObjectMirror)(implicit provider: Provider) : Insight = {

    val name = params.get("name").asInstanceOf[String]
    val version = params.get("version").asInstanceOf[Double]

    var parser, writer : Option[ScriptObjectMirror] = None
    var enterOn : Option[Vector[String]] = None;

    //@todo verify that this is a function
    if (params.hasMember("parser")) parser = Option(params.get("parser").asInstanceOf[ScriptObjectMirror])
    if (params.hasMember("writer")) writer = Option(params.get("writer").asInstanceOf[ScriptObjectMirror])

    if (parser.isDefined && writer.isDefined && (!parser.get.isFunction || !writer.get.isFunction)) {
      throw new Error("Parser and Writers for insight "+ name+" must both be functions")
    }

    if (params.hasMember("enterOn")) enterOn = Option(
      params.get("enterOn").asInstanceOf[ScriptObjectMirror].asScala.map(_._2).toVector.asInstanceOf[Vector[String]]
    )

    //@todo validation cases
    Insight(
      name,
      version,
      Set(),
      enterOn,
      parser,
      writer
    )
  }
}


case class LanguageSupport(language: String, supportedVersions: Set[String])

case class InsightParserReturn(model: ModelInstance, dependencies: Map[String, AstPrimitiveNode], insight: Insight) extends ParserReturn {
  override def toString = model.definition.identifier.name+": "+model.value+" from "+insight.name
}