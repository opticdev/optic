package nashorn.scriptobjects

import cognitro.core.components.models.ModelDefinition
import cognitro.parsers.AstExtension.AstExtensionBase
import cognitro.parsers.GraphUtils.{AstPrimitiveNode, AstType, BaseNode, NodeType}
import jdk.nashorn.api.scripting.ScriptObjectMirror
import play.api.libs.json.{JsObject, JsValue}
import gnieh.diffson.playJson._
import graph.{AstNodeWrapper, NodeWrapper}
import nashorn.ScriptObjectUtils

import collection.JavaConverters._
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

class AstExtensionImpl(val extendsNode: AstType,
                       val definition: ModelDefinition,
                       language: String,
                       versions: scala.collection.Set[String],
                       writer: ScriptObjectMirror) extends AstExtensionBase {


  if (!writer.isFunction) {
    throw new Error("Writer for AstExtension must be functional")
  }

  override def updateValue(astNodeWrapper: NodeWrapper, currentValue: JsValue, newValue: JsValue): Unit =  {

    val asAstNodeWrapper = astNodeWrapper.asInstanceOf[AstNodeWrapper]

    val newInstance = definition.instanceOf(newValue)

    val diff = JsonDiff.diff(currentValue, newValue, false)

    implicit val graph = asAstNodeWrapper.graph

    if (diff.ops.size > 0) {
      writer.call(null,
        JsNodeWrapperFactory.buildNode(asAstNodeWrapper, true),
        ScriptObjectUtils.jsObjectToScriptObject(currentValue.as[JsObject]),
        ScriptObjectUtils.jsObjectToScriptObject(newValue.as[JsObject])
      )
    }

  }

}

object AstExtensionImpl {
  def define(componentType: String,
             modelDefinition: ModelDefinition,
             language: String,
             versions: java.util.List[String],
             writer: ScriptObjectMirror) : AstExtensionImpl = {
    define(AstType(componentType), modelDefinition, language, versions.asScala.toSet, writer)
  }

  def define(componentType: AstType,
             modelDefinition: ModelDefinition,
             language: String,
             versions: scala.collection.Set[String],
             writer: ScriptObjectMirror) : AstExtensionImpl = {
    new AstExtensionImpl(componentType, modelDefinition: ModelDefinition, language, versions, writer)
  }
}
