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

  def compareToPath(jsonTrail: JsonTrail): Boolean = {
    val left = path
    val right = jsonTrail.path
    comparePathsHelper(left, right, 0, 0)
  }

  def comparePathsHelper(pathA: Seq[JsonTrailPathComponent], pathB: Seq[JsonTrailPathComponent], pointerA: Int, pointerB: Int): Boolean = {
    (pathA.lift(pointerA), pathB.lift(pointerB)) match {
      case (None, None) => true
      case (None, Some(x)) => false
      case (Some(x), None) => false
      case (Some(a: JsonObject), Some(b: JsonObjectKey)) => comparePathsHelper(pathA, pathB, pointerA + 1, pointerB)
      case (Some(a: JsonArray), Some(b: JsonArrayItem)) => comparePathsHelper(pathA, pathB, pointerA + 1, pointerB)
      case (Some(a: JsonObjectKey), Some(b: JsonObject)) => comparePathsHelper(pathA, pathB, pointerA, pointerB + 1)
      case (Some(a: JsonArrayItem), Some(b: JsonArray)) => comparePathsHelper(pathA, pathB, pointerA, pointerB + 1)
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
