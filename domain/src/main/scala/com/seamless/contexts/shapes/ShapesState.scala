package com.seamless.contexts.shapes

import com.seamless.contexts.shapes.Commands._

sealed trait Shape {
  val shapeId: ShapeId
  val name: String
  val parameters: ShapeParametersDescriptor
}
case class CoreShape(shapeId: ShapeId, parameters: ShapeParametersDescriptor, name: String) extends Shape
case class UserDefinedShape(shapeId: ShapeId, assignedShapeId: ShapeId, parameters: ShapeParametersDescriptor, name: String) extends Shape

case class ShapeParameterDescriptor(shapeId: ShapeId, name: String)
case class ShapeParameter(shapeParameterId: ShapeParameterId, descriptor: ShapeParameterDescriptor, isRemoved: Boolean) {
  def withName(name: String) = {
    this.copy(descriptor = descriptor.copy(name = name))
  }
}
case class BindingDescriptor(shapeParameterId: ShapeParameterId, shapeId: ShapeId, boundShapeId: ShapeId)
case class Binding(bindingId: BindingId, bindingDescriptor: BindingDescriptor)
case class Usage(usageTrail: UsageTrail, usageDescriptor: ShapeUsageDescriptor)

case class ShapesState(
                        shapes: Map[ShapeId, Shape],
                        shapeParameters: Map[ShapeParameterId, ShapeParameter],
                        bindings: Map[BindingId, Binding],
                        bindingsByShapeId: Map[ShapeId, Set[BindingId]],
                        usages: Map[UsageTrail, Usage]
                      ) {


  def subtree(shapeId: ShapeId): Iterator[UsageContextId] = new Iterator[UsageContextId] {
    private var currentTrail = Seq.empty
    private var currentShapeId = shapeId

    override def hasNext: Boolean = ???

    override def next(): UsageContextId = {
      val shape = shapes(currentShapeId)
      // if it has any bound type parameters, queue them

    }
  }

  ////////////////////////////////////////////////////////////////////////////////

  def withShape(shapeId: ShapeId, assignedShapeId: ShapeId, parameters: ShapeParametersDescriptor, name: String) = {
    this.copy(
      shapes = shapes + (shapeId -> UserDefinedShape(shapeId, assignedShapeId, parameters, name))
    )
  }

  def withShapeName(shapeId: ShapeId, name: String) = {
    val shape = shapes(shapeId)
    shape match {
      case s: UserDefinedShape => {
        this.copy(
          shapes = shapes + (shapeId -> s.copy(name = name))
        )
      }
      case _ => this
    }
  }

  def withBaseShape(shapeId: ShapeId, assignedShapeId: ShapeId) = {
    val shape = shapes(shapeId)
    val assignedShape = shapes(assignedShapeId)
    shape match {
      case s: UserDefinedShape => {
        //@TODO clear old bindings too?
        val updated = s.copy(
          assignedShapeId = assignedShapeId,
          parameters = assignedShape.parameters match {
            case p: Primitive => {
              Primitive()
            }
            case p: StaticParameterList => {
              StaticParameterList(p.shapeParameterId)
            }
            case p: DynamicParameterList => {
              DynamicParameterList(p.shapeParameterId)
            }
          }
        )
        this.copy(
          shapes = shapes + (shapeId -> updated)
        )
      }
      case _ => this
    }
  }

  def withoutShape(shapeId: ShapeId) = {
    this.copy(
      shapes = shapes - shapeId
    )
  }

  ////////////////////////////////////////////////////////////////////////////////

  def withShapeParameter(shapeParameterId: ShapeParameterId, shapeId: ShapeId, name: String) = {
    val parameter = ShapeParameter(shapeParameterId, ShapeParameterDescriptor(shapeId, name), isRemoved = false)
    this.copy(
      shapeParameters = shapeParameters + (shapeParameterId -> parameter)
    )
  }

  def withShapeParameterName(shapeParameterId: ShapeParameterId, name: String) = {
    val parameter = shapeParameters(shapeParameterId)
    this.copy(
      shapeParameters = shapeParameters + (shapeParameterId -> parameter.withName(name))
    )
  }

  def withoutShapeParameter(shapeParameterId: ShapeParameterId) = {
    this.copy(
      shapeParameters = shapeParameters - shapeParameterId
    )
  }

  ////////////////////////////////////////////////////////////////////////////////

  def withBinding(bindingId: BindingId, shapeParameterId: ShapeParameterId, shapeId: ShapeId, boundShapeId: ShapeId) = {
    this.copy(
      bindings = bindings + (bindingId -> Binding(bindingId, BindingDescriptor(shapeParameterId, shapeId, boundShapeId))),
      bindingsByShapeId = bindingsByShapeId + (shapeId -> (bindingsByShapeId.getOrElse(shapeId, Set.empty) + bindingId))
    )
  }

  def withUsage(usageTrail: UsageTrail, usageDescriptor: ShapeUsageDescriptor) = {

  }
}
