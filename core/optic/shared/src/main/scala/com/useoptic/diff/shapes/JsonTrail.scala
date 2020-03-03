package com.useoptic.diff.shapes

case class JsonTrail(path: Seq[JsonTrailPathComponent]) {
  def withChild(child: JsonTrailPathComponent) = {
    this.copy(path = this.path :+ child)
  }
  def withoutParent() = {
    this.copy(path = this.path.tail)
  }

  override def toString = path.toString()
}

sealed trait JsonTrailPathComponent

object JsonTrailPathComponent {

  case class JsonObject() extends JsonTrailPathComponent

  case class JsonArray() extends JsonTrailPathComponent

  case class JsonObjectKey(key: String) extends JsonTrailPathComponent

  case class JsonArrayItem(index: Int) extends JsonTrailPathComponent

}
