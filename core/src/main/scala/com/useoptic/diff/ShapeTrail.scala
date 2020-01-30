package com.useoptic.diff

case class ShapeTrail(seq: Seq[String], context: Seq[Seq[String]]) {
  def asStringWithIn: String = {
    if (asString.isEmpty) {
      ""
    } else {
      s"in `${asString}`"
    }
  }

  def asString = {
    context.map(_.mkString(".")).mkString(".") + seq.mkString(".")
  }
}

object ShapeTrail {
  def empty: ShapeTrail = ShapeTrail(Seq.empty, Seq.empty)
  implicit class ShapeTrailImplicits(shapeTrail: ShapeTrail) {
    def append(key: String): ShapeTrail = ShapeTrail(shapeTrail.seq :+ key, shapeTrail.context)
    def listItem: ShapeTrail = ShapeTrail(Seq.empty, context = shapeTrail.context :+ (shapeTrail.seq :+ "[List Item]"))
  }
}
