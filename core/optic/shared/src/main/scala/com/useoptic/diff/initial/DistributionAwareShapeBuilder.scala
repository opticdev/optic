package com.useoptic.diff.initial

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands.ShapeId
import com.useoptic.contexts.shapes.ShapesHelper
import com.useoptic.contexts.shapes.ShapesHelper.{CoreShapeKind, ObjectKind, OptionalKind}
import com.useoptic.diff.MutableCommandStream
import com.useoptic.diff.shapes.JsonTrailPathComponent.{JsonArrayItem, JsonObjectKey}
import com.useoptic.diff.shapes.Resolvers.{ParameterBindings, ResolvedTrail}
import com.useoptic.diff.shapes.{ArrayVisitor, JsonLikeTraverser, JsonLikeVisitors, JsonTrail, ObjectVisitor, PrimitiveVisitor, Resolvers, ShapeDiffResult, ShapeTrail}
import com.useoptic.types.capture.{JsonLike, JsonLikeFrom}

import scala.collection.mutable
import scala.util.Random

object DistributionAwareShapeBuilder {


  def aggregateTrailsAndValues(bodies: Vector[JsonLike]): TrailValueMap = {

    val aggregator = new TrailValueMap(bodies.size)

    val visitor = new ShapeBuilderVisitor(aggregator)

    val jsonLikeTraverser = new JsonLikeTraverser(RfcState.empty, visitor)

    bodies.foreach(body => jsonLikeTraverser.traverse(Some(body), JsonTrail(Seq.empty), None))

    aggregator
  }


  def toShapes(implicit trailValues: TrailValueMap, seed: String = s"${Random.alphanumeric take 6 mkString}") = {
    val commands = new MutableCommandStream
    var count = 0
    val allIdsStore = scala.collection.mutable.ListBuffer[ShapeId]()

    val root = trailValues.getRoot.flatten


    //internal helpers
    implicit val idGenerator: () => String = () => {
      val id = s"${seed}_${count.toString}"
      count = count + 1
      allIdsStore.append(id)
      id
    }

    fromJsons(root, JsonTrail(Seq.empty), false, trailValues.totalSamples)
  }

  private def fromJsons(values: Vector[JsonLike], trail: JsonTrail, inner: Boolean, totalSamples: Int)(implicit trailValues: TrailValueMap, idGenerator: () => String): ShapesToMake = {
    val isOptional = values.size != totalSamples
    val kinds = values.groupBy(v => Resolvers.jsonToCoreKind(v))

    if (isOptional && !inner) {
      val optionalShape = OptionalShape(fromJsons(values, trail, true, totalSamples), trail, idGenerator())
      optionalShape
    } else {

      val shapesToMake: Seq[ShapesToMake] = kinds.map {
        case (kind, examples) => {
          kind match {
            case ShapesHelper.ObjectKind => {
              val fieldIntersection = examples.flatMap(_.fields.keySet).toSet
              val field = fieldIntersection.map(fieldName => {
                val fieldTrail = trail.withChild(JsonObjectKey(fieldName))
                val fieldValues = examples.flatMap(i => i.fields.get(fieldName))
                val fieldShape = fromJsons(fieldValues, fieldTrail, false, examples.size)
                FieldWithShape(fieldName, fieldShape, fieldTrail, idGenerator())
              }).toSeq

              ObjectWithFields(field, trail, idGenerator())
            }
            case ShapesHelper.ListKind => {
              val flattenAllItemsAcrossExamples = examples.flatMap(_.items)

              val listItemTrail = trail.withChild(JsonArrayItem(0))
              val listItemKind = if (flattenAllItemsAcrossExamples.isEmpty) {
                Unknown(listItemTrail, idGenerator())
              } else {
                fromJsons(flattenAllItemsAcrossExamples, listItemTrail, true, examples.size)
              }

              ListOfShape(listItemKind, trail, idGenerator())
            }
            case ShapesHelper.StringKind => PrimitiveKind(ShapesHelper.StringKind, trail, idGenerator())
            case ShapesHelper.NumberKind => PrimitiveKind(ShapesHelper.NumberKind, trail, idGenerator())
            case ShapesHelper.BooleanKind => PrimitiveKind(ShapesHelper.BooleanKind, trail, idGenerator())
            case ShapesHelper.NullableKind => {
              val notNullExamples = examples.filterNot(_.isNull)
              val innerNull = fromJsons(notNullExamples, trail, true, examples.size)
              NullableShape(innerNull, trail, idGenerator())
            }
            case _ => Nothing(trail, idGenerator())
          }
        }
      }.toSeq

      def flattenShapes(shapes: Seq[ShapesToMake]): ShapesToMake = {
        if (shapes.isEmpty) {
          Unknown(trail, idGenerator())
        } else if (shapes.size == 1) {
          shapes.head
        } else {
          if (shapes.exists(_.isInstanceOf[NullableShape])) {
            //override with nullable
            val remainingShapes = shapes.filterNot(_.isInstanceOf[NullableShape])
            NullableShape(flattenShapes(remainingShapes), trail, idGenerator())
          } else {
            OneOfShape(shapes, trail, idGenerator())
          }
        }
      }

      flattenShapes(shapesToMake)
    }
  }


}



//// Shapes to Make
trait ShapesToMake {
  def id: String
  def trail: JsonTrail
}

case class OptionalShape(shape: ShapesToMake, trail: JsonTrail, id: String) extends ShapesToMake
case class NullableShape(shape: ShapesToMake, trail: JsonTrail, id: String) extends ShapesToMake
case class OneOfShape(branches: Seq[ShapesToMake], trail: JsonTrail, id: String) extends ShapesToMake
case class ObjectWithFields(fields: Seq[FieldWithShape], trail: JsonTrail, id: String) extends ShapesToMake
case class ListOfShape(shape: ShapesToMake, trail: JsonTrail, id: String) extends ShapesToMake
case class FieldWithShape(key: String, shape: ShapesToMake, trail: JsonTrail, id: String) extends ShapesToMake
case class Root(shape: ShapesToMake, trail: JsonTrail, id: String) extends ShapesToMake
case class PrimitiveKind(baseShape: CoreShapeKind, trail: JsonTrail, id: String) extends ShapesToMake
case class Unknown(trail: JsonTrail, id: String) extends ShapesToMake
case class Nothing(trail: JsonTrail, id: String) extends ShapesToMake
////

class TrailValueMap(val totalSamples: Int) {
  private val _internal = scala.collection.mutable.Map[JsonTrail, Vector[Option[JsonLike]]]()

  def putValue(trail: JsonTrail, value: JsonLike): Unit = putValueOptional(trail, Some(value))

  def putValueOptional(trail: JsonTrail, value: Option[JsonLike]): Unit = {
    if (_internal.contains(trail)) {
      _internal.put(trail, _internal(trail) :+ value)
    } else {
      _internal.put(trail, Vector(value))
    }
  }

  def getRoot = valuesForTrail(JsonTrail(Seq.empty))

  def toMap: Map[JsonTrail, Vector[Option[JsonLike]]] = _internal.toMap

  def valuesForTrail(trail: JsonTrail): Vector[Option[JsonLike]] = _internal.getOrElse(trail, Vector.empty)

  def hasTrail(trail: JsonTrail) = _internal.contains(trail)

}

class ShapeBuilderVisitor(aggregator: TrailValueMap) extends JsonLikeVisitors {


  override val objectVisitor: ObjectVisitor = new ObjectVisitor {
    override def beginUnknown(value: Map[String, JsonLike], bodyTrail: JsonTrail): Unit = {
      aggregator.putValue(bodyTrail, JsonLikeFrom.map(value))
    }

    override def begin(value: Map[String, JsonLike], bodyTrail: JsonTrail, expected: ResolvedTrail, shapeTrail: ShapeTrail): Unit = {}

    override def visit(key: String, jsonLike: JsonLike, bodyTrail: JsonTrail, trail: Option[ShapeTrail], parentBindings: ParameterBindings): Unit = {
      aggregator.putValue(bodyTrail, jsonLike)
    }

    override def end(): Unit = {}
  }
  override val arrayVisitor: ArrayVisitor = new ArrayVisitor {
    override def beginUnknown(value: Vector[JsonLike], bodyTrail: JsonTrail): Unit = {
      aggregator.putValue(bodyTrail, JsonLikeFrom.array(value))
    }

    override def begin(value: Vector[JsonLike], bodyTrail: JsonTrail, shapeTrail: ShapeTrail, resolvedShapeTrail: ResolvedTrail): Unit = {}

    override def visit(index: Number, value: JsonLike, bodyTrail: JsonTrail, trail: Option[ShapeTrail]): Unit = {
      aggregator.putValue(bodyTrail, value)
    }

    override def end(): Unit = {}
  }
  override val primitiveVisitor: PrimitiveVisitor = new PrimitiveVisitor {
    override def visitUnknown(value: Option[JsonLike], bodyTrail: JsonTrail): Unit = {
      aggregator.putValueOptional(bodyTrail, value)
    }

    override def visit(value: Option[JsonLike], bodyTrail: JsonTrail, trail: Option[ShapeTrail]): Unit = {
      aggregator.putValueOptional(bodyTrail, value)
    }
  }
}
