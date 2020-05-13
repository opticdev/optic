package com.useoptic.diff.initial

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes.ShapesHelper
import com.useoptic.contexts.shapes.ShapesHelper._
import com.useoptic.diff.shapes.JsonTrailPathComponent.{JsonArrayItem, JsonObjectKey}
import com.useoptic.diff.shapes._
import com.useoptic.diff.{ImmutableCommandStream, MutableCommandStream}
import com.useoptic.dsa.SequentialIdGenerator
import com.useoptic.types.capture.JsonLike

import scala.util.Random

object DistributionAwareShapeBuilder {

  def toCommands(bodies: Vector[JsonLike], seed: String = s"${Random.alphanumeric take 6 mkString}"): (ShapeId, ImmutableCommandStream) = {

    val ids = new SequentialIdGenerator(seed)

    val aggregator = aggregateTrailsAndValues(bodies)
    val rootShape = toShapes(aggregator, ids)

    val flattened = rootShape.flattenChildren

    implicit val idGenerator: () => String = () => ids.nextId()

    val commands = new MutableCommandStream

    def buildCommandsFor(shape: ShapesToMake, parent: Option[ShapesToMake]): Unit = {

      def inField = parent.isDefined && parent.get.isInstanceOf[FieldWithShape]
      def inShape = !inField

      shape match {
        case s: ObjectWithFields => {
          commands.appendInit(AddShape(s.id, ObjectKind.baseShapeId, ""))
          s.fields.foreach(field => buildCommandsFor(field, Some(s)))
        }
        case s: OptionalShape => {
          buildCommandsFor(s.shape, Some(s))
          commands.appendDescribe(SetParameterShape(
            if (inField) {
              ProviderInField(parent.get.asInstanceOf[FieldWithShape].id, ShapeProvider(s.shape.id), OptionalKind.innerParam)
            } else {
              ProviderInShape(s.id, ShapeProvider(s.shape.id), OptionalKind.innerParam)
            }
          ))
          commands.appendInit(AddShape(s.id, OptionalKind.baseShapeId, ""))
        }
        case s: NullableShape => {
          buildCommandsFor(s.shape, Some(s))
          commands.appendDescribe(SetParameterShape(
            if (inField) {
              ProviderInField(parent.get.asInstanceOf[FieldWithShape].id, ShapeProvider(s.shape.id), NullableKind.innerParam)
            } else {
              ProviderInShape(s.id, ShapeProvider(s.shape.id), NullableKind.innerParam)
            }
          ))
          commands.appendInit(AddShape(s.id, NullableKind.baseShapeId, ""))
        }
        case s: FieldWithShape => {
          assert(parent.isDefined && parent.get.isInstanceOf[ObjectWithFields], "Fields must have a parent")
          buildCommandsFor(s.shape, Some(s))
          commands.appendInit(AddField(s.id, parent.get.id, s.key, FieldShapeFromShape(s.id, s.shape.id)))
        }
        case s: PrimitiveKind => {
          commands.appendInit(AddShape(s.id, s.baseShape.baseShapeId, ""))
        }
        case s: OneOfShape => {
          s.branches.foreach(branch => {
            buildCommandsFor(branch, Some(s))
            val paramId = idGenerator()
            commands.appendDescribe(AddShapeParameter(paramId, s.id, ""))
            commands.appendDescribe(SetParameterShape(
              if (inField) {
                ProviderInField(parent.get.asInstanceOf[FieldWithShape].id, ShapeProvider(branch.id), paramId)
              } else {
                ProviderInShape(s.id, ShapeProvider(branch.id), paramId)
              }
            ))
          })

          commands.appendInit(AddShape(s.id, OneOfKind.baseShapeId, ""))
        }
        case s: ListOfShape => {
          buildCommandsFor(s.shape, Some(s))
          commands.appendInit(AddShape(s.id, ListKind.baseShapeId, ""))
          commands.appendDescribe(SetParameterShape(
            if (inField) {
              ProviderInField(parent.get.asInstanceOf[FieldWithShape].id, ShapeProvider(s.shape.id), ListKind.innerParam)
            } else {
              ProviderInShape(s.id, ShapeProvider(s.shape.id), ListKind.innerParam)
            }
          ))
        }
        case s: Unknown => {
          commands.appendInit(AddShape(s.id, UnknownKind.baseShapeId, ""))
        }
      }
    }

    buildCommandsFor(rootShape, None)

    (rootShape.id, commands.toImmutable)
  }

  def aggregateTrailsAndValues(bodies: Vector[JsonLike]): TrailValueMap = {

    val aggregator = new TrailValueMap(bodies.size)

    val visitor = new ShapeBuilderVisitor(aggregator)

    val jsonLikeTraverser = new JsonLikeTraverser(RfcState.empty, visitor)

    bodies.foreach(body => jsonLikeTraverser.traverse(Some(body), JsonTrail(Seq.empty)))

    aggregator
  }


  def toShapes(implicit trailValues: TrailValueMap, idGenerator: SequentialIdGenerator = new SequentialIdGenerator): ShapesToMake = {
    val allIdsStore = scala.collection.mutable.ListBuffer[ShapeId]()
    val root = trailValues.getRoot.flatten
    var count = 0

    fromJsons(root, JsonTrail(Seq.empty), false, trailValues.totalSamples)
  }

  private def fromJsons(values: Vector[JsonLike], trail: JsonTrail, inner: Boolean, totalSamples: Int)(implicit trailValues: TrailValueMap, idGenerator: SequentialIdGenerator): ShapesToMake = {
    val isOptional = values.size != totalSamples
    val kinds = values.groupBy(v => Resolvers.jsonToCoreKind(v))

    if (isOptional && !inner) {
      val optionalShape = OptionalShape(fromJsons(values, trail, true, totalSamples), trail, idGenerator.nextId())
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
                FieldWithShape(fieldName, fieldShape, fieldTrail, idGenerator.nextId())
              }).toSeq

              ObjectWithFields(field, trail, idGenerator.nextId())
            }
            case ShapesHelper.ListKind => {
              val flattenAllItemsAcrossExamples = examples.flatMap(_.items)

              val listItemTrail = trail.withChild(JsonArrayItem(0))
              val listItemKind = if (flattenAllItemsAcrossExamples.isEmpty) {
                Unknown(listItemTrail, idGenerator.nextId())
              } else {
                fromJsons(flattenAllItemsAcrossExamples, listItemTrail, true, examples.size)
              }

              ListOfShape(listItemKind, trail, idGenerator.nextId())
            }
            case ShapesHelper.StringKind => PrimitiveKind(ShapesHelper.StringKind, trail, idGenerator.nextId())
            case ShapesHelper.NumberKind => PrimitiveKind(ShapesHelper.NumberKind, trail, idGenerator.nextId())
            case ShapesHelper.BooleanKind => PrimitiveKind(ShapesHelper.BooleanKind, trail, idGenerator.nextId())
            case ShapesHelper.NullableKind => {
              val notNullExamples = examples.filterNot(_.isNull)
              val innerNull = fromJsons(notNullExamples, trail, true, examples.size)
              NullableShape(innerNull, trail, idGenerator.nextId())
            }
          }
        }
      }.toSeq

      def flattenShapes(shapes: Seq[ShapesToMake]): ShapesToMake = {
        if (shapes.isEmpty) {
          Unknown(trail, idGenerator.nextId())
        } else if (shapes.size == 1) {
          shapes.head
        } else {
          if (shapes.exists(_.isInstanceOf[NullableShape])) {
            //override with nullable
            val remainingShapes = shapes.filterNot(_.isInstanceOf[NullableShape])
            NullableShape(flattenShapes(remainingShapes), trail, idGenerator.nextId())
          } else {
            OneOfShape(shapes, trail, idGenerator.nextId())
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
  def flattenChildren: Vector[ShapesToMake]
}

case class OptionalShape(shape: ShapesToMake, trail: JsonTrail, id: String) extends ShapesToMake {override def flattenChildren: Vector[ShapesToMake] = Vector(shape) ++ shape.flattenChildren}
case class NullableShape(shape: ShapesToMake, trail: JsonTrail, id: String) extends ShapesToMake  {override def flattenChildren: Vector[ShapesToMake] = Vector(shape) ++ shape.flattenChildren}
case class OneOfShape(branches: Seq[ShapesToMake], trail: JsonTrail, id: String) extends ShapesToMake {override def flattenChildren: Vector[ShapesToMake] = branches.flatMap(_.flattenChildren).toVector}
case class ObjectWithFields(fields: Seq[FieldWithShape], trail: JsonTrail, id: String) extends ShapesToMake {override def flattenChildren: Vector[ShapesToMake] = fields.flatMap(_.flattenChildren).toVector}
case class ListOfShape(shape: ShapesToMake, trail: JsonTrail, id: String) extends ShapesToMake {override def flattenChildren: Vector[ShapesToMake] = Vector(shape) ++ shape.flattenChildren}
case class FieldWithShape(key: String, shape: ShapesToMake, trail: JsonTrail, id: String) extends ShapesToMake {override def flattenChildren: Vector[ShapesToMake] = Vector(shape) ++ shape.flattenChildren}
case class PrimitiveKind(baseShape: CoreShapeKind, trail: JsonTrail, id: String) extends ShapesToMake {override def flattenChildren: Vector[ShapesToMake] = Vector.empty}
case class Unknown(trail: JsonTrail, id: String) extends ShapesToMake {override def flattenChildren: Vector[ShapesToMake] = Vector.empty}
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
    override def visit(value: JsonLike, bodyTrail: JsonTrail): Unit = aggregator.putValue(bodyTrail, value)
  }
  override val arrayVisitor: ArrayVisitor =new ArrayVisitor {
    override def visit(value: JsonLike, bodyTrail: JsonTrail): Unit = aggregator.putValue(bodyTrail, value)
  }
  override val primitiveVisitor: PrimitiveVisitor = new PrimitiveVisitor {
    override def visit(value: JsonLike, bodyTrail: JsonTrail): Unit = aggregator.putValue(bodyTrail, value)
  }
}
