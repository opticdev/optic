package com.seamless.diff

case class ShapeTrail(seq: Seq[String], context: Seq[Seq[String]])

object ShapeTrail {
  def empty: ShapeTrail = ShapeTrail(Seq.empty, Seq.empty)
  implicit class ShapeTrailImplicits(shapeTrail: ShapeTrail) {
    def append(key: String): ShapeTrail = ShapeTrail(shapeTrail.seq :+ key, shapeTrail.context)
    def listItem: ShapeTrail = ShapeTrail(Seq.empty, context = shapeTrail.context :+ (shapeTrail.seq :+ "[List Item]"))
  }
}
