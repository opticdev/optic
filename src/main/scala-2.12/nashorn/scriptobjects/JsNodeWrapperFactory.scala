package nashorn.scriptobjects


import cognitro.parsers.GraphUtils.{Child, NodeType, Primitive}
import cognitro.core.nashorn.SafetyClass
import graph.{AstNodeWrapper, FileNodeWrapper, InsightModelNode}
import jdk.nashorn.api.scripting.{JSObject, ScriptObjectMirror}
import nashorn.{NashornParser, ScriptObjectUtils}

import scala.collection.JavaConverters._
import play.api.libs.json._


object JsNodeWrapperFactory {

  class Mutator(nodeWrapper: AstNodeWrapper) {
    def getString = nodeWrapper.getString
    def replaceString(newString: String) = nodeWrapper.replaceString(newString)
  }

  def buildNode(nodeWrapper: AstNodeWrapper, canWrtieBool: Boolean = false) : JSObject = {

    val newObject = ScriptObjectUtils.objConstructor.newObject().asInstanceOf[JSObject]
    //set properties of JSObject
    newObject.setMember("type", nodeWrapper.node.nodeType.name)
    newObject.setMember("properties", ScriptObjectUtils.jsObjectToScriptObject(nodeWrapper.node.properties.asInstanceOf[JsObject]))
    newObject.setMember("range", Map(
      "start" -> nodeWrapper.node.range._1,
      "end" -> nodeWrapper.node.range._2
    ).asJava)



    nodeWrapper.childrenByEdgeType.foreach(item => {
      val edgeType = item._1
      val childrenVector = item._2
      newObject.setMember(item._1, childrenVector.map(i=>JsNodeWrapperFactory.buildNode(i, canWrtieBool)).asJava )
    })

    newObject.setMember("children", nodeWrapper.children.map(i=>JsNodeWrapperFactory.buildNode(i, canWrtieBool)).asJava)

    //add the mutator accessors
    if (canWrtieBool) {
      newObject.setMember("mutator", new Mutator(nodeWrapper))
    }

    def asScalaNode(safety: SafetyClass) : AstNodeWrapper = {
      if (safety != null) {
        nodeWrapper
      } else null
    }

    newObject.setMember("asScalaNode",  (safety: SafetyClass)=> asScalaNode(safety))

    newObject
  }
}


object JsModelNodeWrapperFactory {

  private def toString(string: String) = ScriptObjectUtils.engine.eval("function () { return '"+string+"' }")

  def buildNode(modelNode: InsightModelNode, canWrtieBool: Boolean = false) : JSObject = {

    val newObject = ScriptObjectUtils.objConstructor.newObject().asInstanceOf[JSObject]

    //set properties of JSObject
    newObject.setMember("type", modelNode.nodeType.name)
    newObject.setMember("properties", ScriptObjectUtils.jsObjectToScriptObject(modelNode.getValue.asInstanceOf[JsObject]))

    def asScalaNode(safety: SafetyClass) : InsightModelNode = {
      if (safety != null) {
        modelNode
      } else null
    }

    newObject.setMember("toString", toString( "ModelNode "+modelNode.nodeType.name ))

    newObject.setMember("asScalaNode",  (safety: SafetyClass)=> asScalaNode(safety))

    newObject
  }
}