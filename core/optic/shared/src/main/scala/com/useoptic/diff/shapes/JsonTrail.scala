package com.useoptic.diff.shapes

import com.useoptic.diff.shapes.JsonTrailPathComponent.{JsonArray, JsonArrayItem, JsonObject, JsonObjectKey}

case class JsonTrail(path: Seq[JsonTrailPathComponent]) {
  def withChild(child: JsonTrailPathComponent) = {
    this.copy(path = this.path :+ child)
  }

  def withoutParent() = {
    this.copy(path = this.path.tail)
  }

  override def toString = path.toString()
  //@todo this is smelly. prefer new comparators. every internal equality check will use this too
  def compareLoose(obj: Any): Boolean = obj match {
    case trail: JsonTrail => compareToPath(trail)
    case _ => false
  }

  def compareToPath(jsonTrail: JsonTrail): Boolean = {
    val left = path
    val right = jsonTrail.path
    comparePathsHelper(left, right, 0, 0)
  }

  def comparePathsHelper(pathA: Seq[JsonTrailPathComponent], pathB: Seq[JsonTrailPathComponent], pointerA: Int, pointerB: Int): Boolean = {
    (pathA.lift(pointerA), pathB.lift(pointerB)) match {
      case (Some(a: JsonArrayItem), Some(b: JsonArrayItem)) => true
      case (a, b) => a == b
    }
  }
}

sealed trait JsonTrailPathComponent

object JsonTrailPathComponent {

  case class JsonObject() extends JsonTrailPathComponent

  case class JsonArray() extends JsonTrailPathComponent

  case class JsonObjectKey(key: String) extends JsonTrailPathComponent

  case class JsonArrayItem(index: Int) extends JsonTrailPathComponent

}
