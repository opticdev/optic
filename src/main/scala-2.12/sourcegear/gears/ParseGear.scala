package sourcegear.gears

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, AstType, BaseNode, Child}
import play.api.libs.json.{JsObject, JsValue}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

abstract class ParseGear extends Serializable {

  val description : NodeDesc

  def matches(entryNode: AstPrimitiveNode, extract: Boolean = false)(implicit graph: Graph[BaseNode, LkDiEdge]) : MatchResults = {

    def compareToDescription(node: AstPrimitiveNode, childType: String, desc: NodeDesc) : MatchResults = {
      val isMatch = node.nodeType == desc.astType &&
                    childType == desc.childType &&
                    desc.propertiesMatch(node.properties)

      //proceed only if raw parts match (avoids costly/needed recursion)
      if (isMatch) {

        val childResults = node.getChildren.zipWithIndex.map{
          case ((edge, node), index) => {
            val childDesc = desc.children.lift(index)
            if (childDesc.isDefined) {
              compareToDescription(node, edge.asInstanceOf[Child].typ, childDesc.get)
            } else {
              MatchResults(false, None)
            }
          }
        }

        val isMatchPlusChildren = isMatch && !childResults.exists(_.isMatch == false)

        if (isMatchPlusChildren) {
          MatchResults(true, Option(childResults.flatMap(_.extracted.getOrElse(Set())).toSet))
        } else {
          MatchResults(false, None)
        }

      } else MatchResults(false, None)

    }

    compareToDescription(entryNode, null, description)

  }


  //Internal Signaling
  case class MatchResults(isMatch: Boolean, extracted: Option[Set[ModelField]])
  case class ModelField(propertyPath: String, value: JsValue)

}

//Storage
case class RulesDesc()
case class NodeDesc(astType: AstType,
                    childType: String,
                    properties: Map[String, JsValue],
                    children: Vector[NodeDesc],
                    rules: Vector[RulesDesc]) {

  def propertiesMatch(jsValue: JsValue) : Boolean = {
    if (!jsValue.isInstanceOf[JsObject]) return false
    val asObject = jsValue.as[JsObject]
    asObject.value.toMap == properties
  }

}
