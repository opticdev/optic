package com.useoptic.diff.initial

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes.ShapesHelper._
import com.useoptic.diff.initial.DistributionAwareShapeBuilder.{buildCommandsFor, toShapes}
import com.useoptic.diff.shapes.JsonTrailPathComponent.{JsonArrayItem, JsonObjectKey}
import com.useoptic.diff.shapes._
import com.useoptic.diff.{ImmutableCommandStream, MutableCommandStream}
import com.useoptic.dsa.{OpticDomainIds, SequentialIdGenerator}
import com.useoptic.types.capture.JsonLike

import scala.util.Random

object DistributionAwareShapeBuilder {

  def streaming(implicit ids: OpticDomainIds) = new StreamingShapeBuilder()

  def toCommands(bodies: Vector[JsonLike])(implicit ids: OpticDomainIds): (ShapeId, ImmutableCommandStream) = {

    val aggregator = aggregateTrailsAndValues(bodies)

    implicit val commands = new MutableCommandStream

    val rootShape = toShapes(aggregator)
    buildCommandsFor(rootShape, None)

    (rootShape.id, commands.toImmutable)
  }

  def buildCommandsFor(shape: ShapesToMake, parent: Option[ShapesToMake])(implicit commands: MutableCommandStream, ids: OpticDomainIds): Unit = {

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
          val paramId = ids.newShapeParameterId
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
            ProviderInShape(s.id, ShapeProvider(s.shape.id), ListKind.innerParam)
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

  def aggregateTrailsAndValues(bodies: Vector[JsonLike])(implicit ids: OpticDomainIds): TrailValueMap = {

    val aggregator = new TrailValueMap()

    val visitor = new ShapeBuilderVisitor(aggregator)

    val jsonLikeTraverser = new JsonLikeTraverser(RfcState.empty, visitor)

    bodies.foreach(body => jsonLikeTraverser.traverse(Some(body), JsonTrail(Seq.empty)))

    aggregator
  }

  def toShapes(trailValues: TrailValueMap): ShapesToMake = trailValues.getRoot.toShape
}

class StreamingShapeBuilder()(implicit ids: OpticDomainIds) {

  private val aggregator = new TrailValueMap()
  private val visitor = new ShapeBuilderVisitor(aggregator)
  private val jsonLikeTraverser = new JsonLikeTraverser(RfcState.empty, visitor)

  def process(jsonLike: JsonLike) = jsonLikeTraverser.traverse(Some(jsonLike), JsonTrail(Seq.empty))

  def toCommands: (String, ImmutableCommandStream) = {
    implicit val commands = new MutableCommandStream
    val rootShape = toShapes(aggregator)
    buildCommandsFor(rootShape, None)
    (rootShape.id, commands.toImmutable)
  }
}

//// Shapes to Make
sealed trait ShapesToMake {
  def id: String
  def trail: JsonTrail
}

case class OptionalShape(shape: ShapesToMake, trail: JsonTrail, id: String) extends ShapesToMake
case class NullableShape(shape: ShapesToMake, trail: JsonTrail, id: String) extends ShapesToMake
case class OneOfShape(branches: Seq[ShapesToMake], trail: JsonTrail, id: String) extends ShapesToMake
case class ObjectWithFields(fields: Seq[FieldWithShape], trail: JsonTrail, id: String) extends ShapesToMake
case class ListOfShape(shape: ShapesToMake, trail: JsonTrail, id: String) extends ShapesToMake
case class FieldWithShape(key: String, shape: ShapesToMake, trail: JsonTrail, id: String) extends ShapesToMake
case class PrimitiveKind(baseShape: CoreShapeKind, trail: JsonTrail, id: String) extends ShapesToMake
case class Unknown(trail: JsonTrail, id: String) extends ShapesToMake


class TrailValueMap()(implicit ids: OpticDomainIds) {


  class ValueAffordanceMap(var trail: JsonTrail) {
    var wasString: Boolean = false
    var wasNumber: Boolean = false
    var wasBoolean: Boolean = false
    var wasNull: Boolean = false
    var wasArray: Boolean = false
    var wasObject: Boolean = false

    private var fieldSet: Set[Set[String]] = Set.empty

    def touchObject(fields: Set[String]) = {
      wasObject = true
      fieldSet = fieldSet + fields
    }

    def isUnknown =
      !wasString &&
        !wasNumber &&
        !wasBoolean &&
        !wasNull &&
        !wasArray &&
        !wasObject

    def toShape: ShapesToMake = {
      val kindsSet: Set[Option[ShapesToMake]] = Set(
        if (wasString) Some(PrimitiveKind(StringKind, trail, ids.newShapeId)) else None,
        if (wasNumber) Some(PrimitiveKind(NumberKind, trail, ids.newShapeId)) else None,
        if (wasBoolean) Some(PrimitiveKind(BooleanKind, trail, ids.newShapeId)) else None,
        if (wasArray) Some({
          val itemTrail = trail.withChild(JsonArrayItem(0))
          val inner = _internal.getOrElseUpdate(itemTrail, new ValueAffordanceMap(itemTrail))
          inner.toShape
          ListOfShape(inner.toShape, trail, ids.newShapeId)
        }) else None,
        if (wasObject) Some({
          val unionOfKeys = fieldSet.flatten

          val optionalKeys = unionOfKeys.collect {
            case key if !fieldSet.forall(i => i.contains(key)) => key
          }

          val fields = unionOfKeys.toVector.sorted.map(key => {
            val fieldTrail = trail.withChild(JsonObjectKey(key))
            val inner = _internal.getOrElseUpdate(fieldTrail, new ValueAffordanceMap(fieldTrail))

            val isOptional = optionalKeys.contains(key)
            val innerShape = inner.toShape

            val fieldShape = if (isOptional) {
              OptionalShape(innerShape, fieldTrail, ids.newShapeId)
            } else {
              innerShape
            }

            FieldWithShape(key, fieldShape, fieldTrail, ids.newFieldId)
          })

          ObjectWithFields(fields, trail, ids.newShapeId)
        }) else None
      )

      val kinds = kindsSet.flatten

      val finalShape: ShapesToMake = if (kinds.size == 1) {
        kinds.head
      } else if (kinds.size > 1) {
        OneOfShape(kinds.toSeq.sortWith {
          case (_: PrimitiveKind, _) => true
          case (a: PrimitiveKind, b: PrimitiveKind) => a.baseShape.baseShapeId > b.baseShape.baseShapeId
          case _ => false
        }, trail, ids.newShapeId)
      } else {
        Unknown(trail, ids.newShapeId)
      }

      if (wasNull) {
        NullableShape(finalShape, trail, ids.newShapeId)
      } else {
        finalShape
      }
    }

  }

  private val _internal = scala.collection.mutable.Map[JsonTrail, ValueAffordanceMap]()

  def putValue(trail: JsonTrail, value: JsonLike): Unit = {
    val affordanceMap = _internal.getOrElseUpdate(trail, new ValueAffordanceMap(trail))

    if (value.isString) {
      affordanceMap.wasString = true
    }
    if (value.isNumber) {
      affordanceMap.wasNumber = true
    }
    if (value.isBoolean) {
      affordanceMap.wasBoolean = true
    }
    if (value.isNull) {
      affordanceMap.wasNull = true
    }
    if (value.isArray) {
      affordanceMap.wasArray = true
    }
    if (value.isObject) {
      affordanceMap.touchObject(value.fields.keySet)
    }

  }

  def getRoot: ValueAffordanceMap = _internal(JsonTrail(Seq.empty))

  def hasTrail(trail: JsonTrail) = _internal.contains(trail)

}
class ShapeBuilderVisitor(aggregator: TrailValueMap) extends JsonLikeVisitors {

  def normalizeTrail(jsonTrail: JsonTrail): JsonTrail = {
    JsonTrail(jsonTrail.path.map {
      case JsonArrayItem(_) => JsonArrayItem(0)
      case a => a
    })
  }

  override val objectVisitor: ObjectVisitor = new ObjectVisitor {
    override def visit(value: JsonLike, bodyTrail: JsonTrail): Unit = aggregator.putValue(normalizeTrail(bodyTrail), value)
  }
  override val arrayVisitor: ArrayVisitor =new ArrayVisitor {
    override def visit(value: JsonLike, bodyTrail: JsonTrail): Unit = aggregator.putValue(normalizeTrail(bodyTrail), value)
  }
  override val primitiveVisitor: PrimitiveVisitor = new PrimitiveVisitor {
    override def visit(value: JsonLike, bodyTrail: JsonTrail): Unit = aggregator.putValue(normalizeTrail(bodyTrail), value)
  }
}
