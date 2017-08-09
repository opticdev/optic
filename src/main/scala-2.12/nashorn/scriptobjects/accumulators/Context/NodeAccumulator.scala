package nashorn.scriptobjects.accumulators.Context

import cognitro.parsers.GraphUtils._
import nashorn.scriptobjects.Presence
import nashorn.scriptobjects.accumulators.Context.LocationPattern.LocationGroupEnum
import nashorn.scriptobjects.accumulators.{Collectible, CollectibleComponent}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import scalax.collection.edge.Implicits._

case class LocationGroup(baseNode: BaseNode, nodes: Set[BaseNode])
case class AccumulatorMatch(locationGroup: LocationGroup, distinctModel: ModelNode, dependencies: Set[BaseNode])

class NodeAccumulator(private val collect: Seq[CollectibleComponent], private implicit val graph: Graph[BaseNode, LkDiEdge]) {
  def groupResults(sortedNodes: Map[ModelType, Vector[ModelNode]]) = {
    val groups = locationGroups(sortedNodes)

    val matches = groups.flatMap(group=> {
      val nodes = group.nodes

      val hasRequired = requiredComponents.foldLeft((true, Set[BaseNode]())) {
        case ((bool, set), component) => {
          //remain false if set false once
          if (!bool) (false, set) else {
            //@todo when you can match multiple model types we need to match on more than model type. easy...
            val found = nodes.filter(_.isModelType(component.modelType))
            (component.occurrence.evaluate(found.size), set ++ found)
          }
        }
      }

      val hasDistinct = {
        if (distinctComponentOption.isDefined) {
          val distinctComponent = distinctComponentOption.get
          val found = nodes.filter(_.isModelType(distinctComponent.modelType))
          (true, found)
        } else (false, Set())
      }

      if (hasDistinct._1 && hasRequired._1) {
        hasDistinct._2.map(i=> {
          AccumulatorMatch(group, i.asInstanceOf[ModelNode], hasRequired._2)
        })
      } else Set()

    }.asInstanceOf[Set[AccumulatorMatch]])

    matches

  }

  private def locationGroups(sortedNodes: Map[ModelType, Vector[ModelNode]]) : Set[LocationGroup] = {

    val locationRules = collect.map(_.location)
    val locationGroupSet = locationRules.flatMap(_.locationRules.map(_.groupType)).toSet

    //Rule Enums

    val FILE = LocationGroupEnum.FILE
    if (locationGroupSet == Set(FILE)) {
      val allModelNodes = sortedNodes.flatMap(_._2)
      val groupedByFile = allModelNodes.groupBy(_.fileNode(graph))
      groupedByFile.map(lg=> LocationGroup(lg._1, lg._2.toSet)).toSet

    } else {
      throw new Error("Unimplemented File Group permutation "+locationGroupSet)
    }

  }

  private lazy val distinctComponentOption: Option[CollectibleComponent] = {
    val distincts = collect.filter(_.presence == Presence.DISTINCT)
    if (distincts.size == 1) Option(distincts.head) else None
  }

  private lazy val requiredComponents: Set[CollectibleComponent] = collect.filter(_.presence == Presence.REQUIRED).toSet

  private lazy val optionalComponents: Set[CollectibleComponent] = collect.filter(_.presence == Presence.OPTIONAL).toSet

}