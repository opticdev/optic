package com.seamless.contexts.shapes

import com.seamless.contexts.shapes.Commands._

import scala.collection.immutable.ListMap
import scala.scalajs.js.annotation.JSExportAll

case class ShapeValue(isUserDefined: Boolean, baseShapeId: ShapeId, parameters: ShapeParametersDescriptor, fieldOrdering: Seq[FieldId], name: String)
case class ShapeEntity(shapeId: ShapeId, descriptor: ShapeValue, isRemoved: Boolean = false) {
  def withShapeDescriptor(shapeId: ShapeId) = {
    this.copy(descriptor = descriptor.copy(baseShapeId = shapeId))
  }

  def withName(name: String) = {
    this.copy(descriptor = descriptor.copy(name = name))
  }

  def withParameters(parameters: ShapeParametersDescriptor) = {
    this.copy(descriptor = descriptor.copy(parameters = parameters))
  }

  def withAppendedFieldId(fieldId: FieldId) = {
    this.copy(descriptor = descriptor.copy(fieldOrdering = descriptor.fieldOrdering :+ fieldId))
  }
}

case class ShapeParameterValue(shapeId: ShapeId, shapeDescriptor: ParameterShapeDescriptor, name: String)
case class ShapeParameterEntity(shapeParameterId: ShapeParameterId, descriptor: ShapeParameterValue, isRemoved: Boolean) {
  def withShapeDescriptor(parameterShapeDescriptor: ParameterShapeDescriptor) = {
    this.copy(descriptor = descriptor.copy(shapeDescriptor = parameterShapeDescriptor))
  }

  def withName(name: String) = {
    this.copy(descriptor = descriptor.copy(name = name))
  }
}

case class FieldValue(shapeId: ShapeId, shapeDescriptor: FieldShapeDescriptor, name: String)
case class FieldEntity(fieldId: FieldId, descriptor: FieldValue, isRemoved: Boolean = false) {
  def withShapeDescriptor(fieldShapeDescriptor: FieldShapeDescriptor): FieldEntity = {
    this.copy(descriptor = descriptor.copy(shapeDescriptor = fieldShapeDescriptor))
  }

  def withName(name: String): FieldEntity = {
    this.copy(descriptor = descriptor.copy(name = name))
  }
}

@JSExportAll
case class Parameter(shapeParameterId: ShapeParameterId, name: String, isRemoved: Boolean)
@JSExportAll
case class FlattenedField(fieldId: FieldId, name: String, fieldShapeDescriptor: FieldShapeDescriptor, bindings: Map[ShapeParameterId, Option[ProviderDescriptor]], isRemoved: Boolean)
@JSExportAll
case class FlattenedShape(shapeId: ShapeId, name: String, baseShapeId: ShapeId, coreShapeId: ShapeId, parameters: Seq[Parameter], bindings: Map[ShapeParameterId, Option[ProviderDescriptor]], fields: Seq[FlattenedField], isRemoved: Boolean)


case class ShapesState(
                        shapes: Map[ShapeId, ShapeEntity],
                        bindingsByShapeId: Map[ShapeId, Map[ShapeParameterId, ProviderDescriptor]],
                        shapeParameters: Map[ShapeParameterId, ShapeParameterEntity],
                        fields: ListMap[FieldId, FieldEntity],
                        bindingsByFieldId: Map[FieldId, Map[ShapeParameterId, ProviderDescriptor]]
                      ) {

  ////////////////////////////////////////////////////////////////////////////////

  def withShape(shapeId: ShapeId, assignedShapeId: ShapeId, parameters: ShapeParametersDescriptor, name: String) = {
    this.copy(
      shapes = shapes + (shapeId -> ShapeEntity(shapeId, ShapeValue(isUserDefined = true, assignedShapeId, parameters, Seq.empty, name)))
    )
  }

  def withShapeName(shapeId: ShapeId, name: String) = {
    val shape = shapes(shapeId)
    shape match {
      case s: ShapeEntity => {
        this.copy(
          shapes = shapes + (shapeId -> s.withName(name))
        )
      }
      case _ => this
    }
  }

  def withBaseShape(shapeId: ShapeId, baseShapeId: ShapeId) = {
    val shape = shapes(shapeId)
    val baseShape = shapes(baseShapeId)
    shape match {
      case s: ShapeEntity => {
        val updatedParameters = baseShape.descriptor.parameters match {
          case p: NoParameterList => {
            NoParameterList()
          }
          case p: StaticParameterList => {
            DynamicParameterList(Seq.empty)
          }
          case p: DynamicParameterList => {
            DynamicParameterList(Seq.empty)
          }
        }
        val updated = s.withShapeDescriptor(baseShapeId).withParameters(updatedParameters)
        this.copy(
          shapes = shapes + (shapeId -> updated)
        )
      }
      case _ => this
    }
  }

  def withoutShape(shapeId: ShapeId) = {
    val s = shapes(shapeId)
    this.copy(
      shapes = shapes + (shapeId -> s.copy(isRemoved = true))
    )
  }

  ////////////////////////////////////////////////////////////////////////////////

  def withField(fieldId: FieldId, shapeId: ShapeId, name: String, shapeDescriptor: FieldShapeDescriptor) = {
    val shape = shapes(shapeId)
    this.copy(
      shapes = shapes + (shapeId -> shape.withAppendedFieldId(fieldId)),
      fields = fields + (fieldId -> FieldEntity(fieldId, FieldValue(shapeId, shapeDescriptor, name), isRemoved = false))
    )
  }

  def withoutField(fieldId: FieldId) = {
    val f = fields(fieldId)
    this.copy(
      fields = fields + (fieldId -> f.copy(isRemoved = true))
    )
  }

  def withFieldName(fieldId: FieldId, name: String) = {
    val f = fields(fieldId)
    this.copy(
      fields = fields + (fieldId -> f.withName(name))
    )
  }

  def withFieldShape(fieldShapeDescriptor: FieldShapeDescriptor) = {
    val f = fields(fieldShapeDescriptor.fieldId)
    this.copy(
      fields = fields + (f.fieldId -> f.withShapeDescriptor(fieldShapeDescriptor))
    )
  }

  ////////////////////////////////////////////////////////////////////////////////

  def withShapeParameter(shapeParameterId: ShapeParameterId, shapeId: ShapeId, shapeDescriptor: ParameterShapeDescriptor, name: String) = {

    val shape = shapes(shapeId)
    shape match {
      case s: ShapeEntity => {
        val parameter = ShapeParameterEntity(shapeParameterId, ShapeParameterValue(shapeId, shapeDescriptor, name), isRemoved = false)
        val parameters = s.descriptor.parameters match {
          case DynamicParameterList(ids) => DynamicParameterList(ids :+ shapeParameterId)
          case x => x
        }
        this.copy(
          shapes = shapes + (shapeId -> s.withParameters(parameters)),
          shapeParameters = shapeParameters + (shapeParameterId -> parameter)
        )
      }
      case _ => this
    }

  }

  def withShapeParameterName(shapeParameterId: ShapeParameterId, name: String) = {
    val parameter = shapeParameters(shapeParameterId)
    this.copy(
      shapeParameters = shapeParameters + (shapeParameterId -> parameter.withName(name))
    )
  }

  def withoutShapeParameter(shapeParameterId: ShapeParameterId) = {
    val parameter = shapeParameters(shapeParameterId)

    this.copy(
      shapeParameters = shapeParameters + (shapeParameterId -> parameter.copy(isRemoved = true))
    )
  }

  def withShapeParameterShape(shapeDescriptor: ParameterShapeDescriptor) = {
    println(shapeDescriptor)
    shapeDescriptor match {
      case p: NoProvider => this
      case p: ProviderInField => {
        val newBindings = bindingsByFieldId.getOrElse(p.fieldId, Map.empty) + (p.consumingParameterId -> p.providerDescriptor)

        this.copy(
          bindingsByFieldId = bindingsByFieldId + (p.fieldId -> newBindings)
        )
      }
      case p: ProviderInShape => {
        val newBindings = bindingsByShapeId.getOrElse(p.shapeId, Map.empty) + (p.consumingParameterId -> p.providerDescriptor)
        this.copy(
          bindingsByShapeId = bindingsByShapeId + (p.shapeId -> newBindings)
        )
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////

  def resolveCoreShapeId(shapeId: ShapeId): ShapeId = {
    val shape = shapes(shapeId)
    if (shape.descriptor.isUserDefined) {
      val baseShape = shapes(shape.descriptor.baseShapeId)
      resolveCoreShapeId(baseShape.shapeId)
    } else {
      shape.descriptor.baseShapeId
    }
  }

  def resolveCoreShapeIdForField(fieldId: FieldId): ShapeId = {
    val field = fields(fieldId)
    field.descriptor.shapeDescriptor match {
      case s: FieldShapeFromParameter => {
        "xxx" // @TODO resolveParameterBindingsForField
      }
      case s: FieldShapeFromShape => {
        resolveCoreShapeId(s.shapeId)
      }
    }
  }

  def listParameterIds(shapeId: ShapeId): Seq[ShapeParameterId] = {
    val shape = shapes(shapeId)
    val parameterIds = shape.descriptor.parameters match {
      case NoParameterList() => Seq.empty
      case StaticParameterList(ids) => ids
      case DynamicParameterList(ids) => ids
    }
    if (shape.descriptor.isUserDefined) {
      val baseShapeParameterIds = listParameterIds(shape.descriptor.baseShapeId)
      baseShapeParameterIds ++ parameterIds
    } else {
      parameterIds
    }
  }

  def resolveParameterBindingsForField(fieldId: FieldId): Map[ShapeParameterId, Option[ProviderDescriptor]] = {
    val field = fields(fieldId)

    val bindingsForFieldId = bindingsByFieldId.getOrElse(fieldId, Map.empty)
    val (parameterIds, mapping) = field.descriptor.shapeDescriptor match {
      case s: FieldShapeFromShape => {
        val parameterIds = listParameterIds(s.shapeId)
        val bindings = bindingsByShapeId.getOrElse(s.shapeId, Map.empty) ++ bindingsForFieldId
        (parameterIds, bindings)
      }
      case s: FieldShapeFromParameter => {
        (Seq.empty, bindingsForFieldId)
      }
    }
    parameterIds.map(parameterId => {
      val boundShapeId: Option[ProviderDescriptor] = mapping.get(parameterId) match {
        case Some(p) => {
          p match {
            case pp: ParameterProvider => Some(pp)
            case sp: ShapeProvider => Some(sp)
            case NoProvider() => None
          }
        }
        case None => None
      }
      parameterId -> boundShapeId
    }).toMap
  }

  def resolveParameterBindings(shapeId: ShapeId): Map[ShapeParameterId, Option[ProviderDescriptor]] = {
    val shape = shapes(shapeId)

    val bindingsForShapeId = bindingsByShapeId.getOrElse(shapeId, Map.empty)
    val parameterIds = listParameterIds(shapeId)
    val mapping = if (shape.descriptor.isUserDefined) {
      val combined = bindingsByShapeId.getOrElse(shape.descriptor.baseShapeId, Map.empty) ++ bindingsForShapeId
      combined
    } else {
      bindingsForShapeId
    }

    parameterIds.map(parameterId => {
      val boundShapeId: Option[ProviderDescriptor] = mapping.get(parameterId) match {
        case Some(p) => {
          p match {
            case ParameterProvider(shapeParameterId) => None
            case ShapeProvider(shapeId) => Some(ShapeProvider(shapeId))
            case NoProvider() => None
          }
        }
        case None => None
      }
      parameterId -> boundShapeId
    }).toMap
  }


  def flattenedShape(shapeId: ShapeId) = {
    val shape = shapes(shapeId)
    val coreShapeId = resolveCoreShapeId(shapeId)
    val bindings = resolveParameterBindings(shapeId)

    val parameterIds = shape.descriptor.parameters match {
      case NoParameterList() => Seq.empty
      case DynamicParameterList(ids) => ids
      case StaticParameterList(ids) => ids
    }
    val parameters = parameterIds.map(parameterId => {
      val parameter = shapeParameters(parameterId)
      Parameter(parameter.shapeParameterId, parameter.descriptor.name, parameter.isRemoved)
    })

    val fieldsOfShape = if (shape.descriptor.baseShapeId == "$object") {
      shape.descriptor.fieldOrdering
        .map(flattenedField)
    } else {
      Seq.empty
    }

    FlattenedShape(shapeId, shape.descriptor.name, shape.descriptor.baseShapeId, coreShapeId, parameters, bindings, fieldsOfShape, shape.isRemoved)
  }

  def flattenedField(fieldId: FieldId) = {
    val field = fields(fieldId)
    val bindings = resolveParameterBindingsForField(fieldId)
    FlattenedField(fieldId, field.descriptor.name, field.descriptor.shapeDescriptor, bindings, field.isRemoved)
  }
}
