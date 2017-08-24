package sourcegear.gears

import cognitro.parsers.GraphUtils.Path.{FlatWalkablePath, WalkablePath}
import cognitro.parsers.GraphUtils.{AstPrimitiveNode, AstType, BaseNode, Child}
import play.api.libs.json.{JsObject, JsValue}
import sdk.descriptions.{Component, PropertyRule, RawRule, Rule}
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

        val propertyRules = rulesAtPath.filter(_.isPropertyRule).asInstanceOf[Vector[PropertyRule]]
        val propertiesMatch = desc.propertiesMatch(node, propertyRules)

        val rawRules = rulesAtPath.filter(_.isRawRule).asInstanceOf[Vector[RawRule]]
        import sourcegear.gears.helpers.RuleEvaluation._
        val rawRulesEvaluated = rawRules.forall(_.evaluate(node))

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

  def propertiesMatch(node: AstPrimitiveNode, propertyRules: Vector[PropertyRule])(implicit graph: Graph[BaseNode, LkDiEdge], fileContents: String)  : Boolean = {
    val jsValue = node.properties
    if (!jsValue.isInstanceOf[JsObject]) return false
    val asMap = jsValue.as[JsObject].value.toMap
    if (asMap.nonEmpty) {
      import sourcegear.gears.helpers.RuleEvaluation._

      val overridenKeys = propertyRules.map(_.key)

      val filteredMap        = asMap.filterKeys(!overridenKeys.contains(_))
      val filteredProperties = properties.filterKeys(!overridenKeys.contains(_))

      filteredMap == filteredProperties && propertyRules.forall(_.evaluate(node) == true)
    } else {
      asMap == properties
    }
  }
}


