package nashorn.scriptobjects.accumulators

import cognitro.core.components.models.ModelInstance
import cognitro.parsers.GraphUtils.{BaseNode, ModelNode, ModelType}
import graph.InsightModelNode
import jdk.nashorn.api.scripting.ScriptObjectMirror
import nashorn.ScriptObjectUtils
import nashorn.scriptobjects.Presence
import nashorn.scriptobjects.accumulators.Context.{AccumulatorMatch, LocationPattern, NodeAccumulator}
import nashorn.scriptobjects.models.ModelPattern
import play.api.libs.json.{JsNumber, JsObject, JsString, JsValue}

import scala.collection.mutable
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph


class Collectible(collect: CollectibleComponent*) {

  def collectibleResponseFromGraph(implicit subGraph: Graph[BaseNode, LkDiEdge]): Set[AccumulatorMatch] = {
    val sortedNodes = collectNodes(subGraph)
    groupNodes(sortedNodes)
  }

  def collectNodes(implicit subGraph: Graph[BaseNode, LkDiEdge]) : Map[ModelType, Vector[ModelNode]] = {
    collect.map(i=> {
      val modelType = i.modelType
      val preliminaryMatches = subGraph.nodes
        .filter(n=> i.graphQuery(n.value))
        .map(_.value)
        .toVector.asInstanceOf[Vector[ModelNode]]
      (modelType, preliminaryMatches)
    }).toMap
  }

  def groupNodes(sortedNodes: Map[ModelType, Vector[ModelNode]])(implicit subGraph: Graph[BaseNode, LkDiEdge]) = {
    val nodeAccumulator = new NodeAccumulator(collect, subGraph)
    nodeAccumulator.groupResults(sortedNodes)
  }


  def this(jsObject: JsObject) = {
    this(jsObject.fields.map(field=> {
      new CollectibleComponent(field._1, field._2)
    }):_*)
  }

  def this(scriptObjectMirror: ScriptObjectMirror) = {
    this(ScriptObjectUtils.parseToJsValue(scriptObjectMirror).asInstanceOf[JsObject])
  }


}

class CollectibleComponent(_modelType: ModelType,
                           _presence: Presence.Value,
                           _valuePattern: Option[ModelPattern],
                           _location: LocationPattern = LocationPattern.default,
                           _occurrence: Occurrence = AtLeastOccurrence(1)) {
  def this(string: String, jsValue: JsValue) {
    this (
      ModelType(string),
      {if (jsValue.isInstanceOf[JsObject]) {
        val presenceOption = (jsValue.asInstanceOf[JsObject] \ "presence").toOption
        if (presenceOption.isDefined) {
          Presence.fromString(presenceOption.get.as[JsString].value)
        } else Presence.REQUIRED
      } else throw new Error("Invalid input for Collectible "+jsValue.toString())},

      {
        if (jsValue.isInstanceOf[JsObject]) {
          val valueOptions = (jsValue.asInstanceOf[JsObject] \ "value").toOption
          if (valueOptions.isDefined) Option(ModelPattern.fromJs(valueOptions.get)) else None
        } else throw new Error("Invalid input for Collectible "+jsValue.toString())},

      {
        {if (jsValue.isInstanceOf[JsObject]) {
          val locationOption = (jsValue.asInstanceOf[JsObject] \ "location").toOption
          if (locationOption.isDefined) LocationPattern.fromJs(locationOption.get) else LocationPattern.default
        } else throw new Error("Invalid input for Collectible "+jsValue.toString())}
      },

      {if (jsValue.isInstanceOf[JsObject]) {
        val occurrenceOption = (jsValue.asInstanceOf[JsObject] \ "occurrence").toOption
        if (occurrenceOption.isDefined) {
          val error = new Error("Invalid occurrence value. Must be a number or ['Any', 'None']")
          occurrenceOption.get match {
            case n: JsNumber => OccurrenceInt(n.value.intValue())
            case s: JsString => s.value match {
              case "Any" => AnyOccurrence()
              case "None" => NoOccurrence()
              case _ => throw error
            }
            case _ => throw error
          }
        } else {
          AtLeastOccurrence(1)
        }
      } else throw new Error("Invalid input for Collectible "+jsValue.toString())}
    )
  }

  val modelType = _modelType
  val presence = _presence
  val valuePattern = _valuePattern
  val location = _location
  val occurrence = if (_presence == Presence.DISTINCT) OccurrenceInt(1) else _occurrence


  def graphQuery(baseNode: BaseNode)(implicit graph: Graph[BaseNode, LkDiEdge]) : Boolean = {
    if (baseNode.isModelType(modelType)) {
      val model = baseNode.asInstanceOf[ModelNode]
      val value = model.getValue

      var matches = true

      if (matches && valuePattern.isDefined) {
        val pattern = valuePattern.get
        matches = pattern.evaluate(value.as[JsObject])
      }

      matches

    } else false
  }

}
