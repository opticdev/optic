package sourcegear.gears

import cognitro.parsers.GraphUtils.Path.{FlatWalkablePath, WalkablePath}
import cognitro.parsers.GraphUtils.{AstPrimitiveNode, AstType, BaseNode, Child}
import play.api.libs.json.{JsObject, JsValue}
import sdk.descriptions.{Component, Rule}
import sdk.descriptions.Finders.FinderPath
import sourcegear.gears.helpers.ModelField

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

abstract class ParseGear extends Serializable {

  val description : NodeDesc
  val components: Map[FlatWalkablePath, Vector[Component]]
  val rules: Map[FlatWalkablePath, Vector[Rule]]

  def matches(entryNode: AstPrimitiveNode, extract: Boolean = false)(implicit graph: Graph[BaseNode, LkDiEdge], fileContents: String) : MatchResults = {

    def compareToDescription(node: AstPrimitiveNode, childType: String, desc: NodeDesc, currentPath: FlatWalkablePath) : MatchResults = {
      val componentsAtPath = components.getOrElse(currentPath, Vector[Component]())
      val rulesAtPath      = rules.getOrElse(currentPath, Vector[Rule]())

      val isMatch = {
        val nodeTypesMatch = node.nodeType == desc.astType
        val childTypesMatch = childType == desc.childType

        //@todo implement property rule key overrides
        val propertiesMatch = desc.propertiesMatch(node.properties)

        val rawRules = rulesAtPath.filter(_.isRawRule)

        val rawRulesEvaluated = rawRules.filter(_.isRawRule).forall(_.evaluate(node))

        val compareSet = {
          val base = Seq(nodeTypesMatch, childTypesMatch)
          if (rawRules.nonEmpty) {
            base :+ rawRulesEvaluated
          } else {
            base :+ propertiesMatch
          }
        }

        compareSet.forall(_ == true)
      }

//      val isMatch = node.nodeType == desc.astType &&
//                    childType == desc.childType &&
//                    desc.propertiesMatch(node.properties)

      //proceed only if raw parts match (avoids costly/unneeded recursion)
      if (isMatch) {

        //extract any values we need to
        val extractedFields = if (extract) {
          import sourcegear.gears.helpers.ComponentExtraction._
          componentsAtPath.map(i=> {
            i.extract(node)
          })
        } else Set()


        val childResults = node.getChildren.zipWithIndex.map{
          case ((edge, node), index) => {
            val childDesc = desc.children.lift(index)
            if (childDesc.isDefined) {
              compareToDescription(node, edge.asInstanceOf[Child].typ, childDesc.get, currentPath.append(edge.asInstanceOf[Child]))
            } else {
              MatchResults(false, None)
            }
          }
        }

        val isMatchPlusChildren = isMatch && !childResults.exists(_.isMatch == false)

        if (isMatchPlusChildren) {
          MatchResults(true, Option(childResults.flatMap(_.extracted.getOrElse(Set())).toSet ++ extractedFields))
        } else {
          MatchResults(false, None)
        }

      } else MatchResults(false, None)

    }

    compareToDescription(entryNode, null, description, FlatWalkablePath())

  }


  //Internal Signaling
  case class MatchResults(isMatch: Boolean, extracted: Option[Set[ModelField]])

}

//Serializable for Storage
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


