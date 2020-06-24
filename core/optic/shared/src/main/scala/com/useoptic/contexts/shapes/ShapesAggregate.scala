package com.useoptic.contexts.shapes

import com.useoptic.contexts.base.BaseCommandContext
import com.useoptic.contexts.rfc.Events.{EventContext, fromCommandContext}
import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes.Events._
import com.useoptic.contexts.shapes.ShapesHelper.OptionalKind
import com.useoptic.ddd.{Effects, EventSourcedAggregate}
import com.useoptic.dsa.OpticDomainIds

import scala.collection.immutable.ListMap

case class ShapesCommandContext(
                                 override val clientId: String,
                                 override val clientSessionId: String,
                                 override val clientCommandBatchId: String
                               ) extends BaseCommandContext

object ShapesAggregate extends EventSourcedAggregate[ShapesState, ShapesCommand, ShapesCommandContext, ShapesEvent] {
  override def handleCommand(_state: ShapesState)(implicit ids: OpticDomainIds): PartialFunction[(ShapesCommandContext, ShapesCommand), Effects[ShapesEvent]] = {
    case (commandContext: ShapesCommandContext, command: ShapesCommand) => {

      implicit val state: ShapesState = _state
      val eventContext: Option[EventContext] = Some(fromCommandContext(commandContext))

      command match {

        ////////////////////////////////////////////////////////////////////////////////

        case c: AddShape => {
          Validators.ensureShapeIdAssignable(c.shapeId)
          Validators.ensureShapeIdExists(c.baseShapeId)
          persist(Events.ShapeAdded(c.shapeId, c.baseShapeId, DynamicParameterList(Seq.empty), c.name, eventContext))
        }

        case c: SetBaseShape => {
          Validators.ensureBaseShapeIdCanBeSet(c.shapeId)
          Validators.ensureShapeIdExists(c.shapeId)
          Validators.ensureShapeIdExists(c.baseShapeId)
          persist(Events.BaseShapeSet(c.shapeId, c.baseShapeId, eventContext))
        }

        case c: RenameShape => {
          Validators.ensureShapeIdExists(c.shapeId)
          persist(Events.ShapeRenamed(c.shapeId, c.name, eventContext))
        }

        case c: RemoveShape => {
          Validators.ensureShapeIdExists(c.shapeId)
          persist(Events.ShapeRemoved(c.shapeId, eventContext))
        }

        ////////////////////////////////////////////////////////////////////////////////

        case c: AddField => {
          Validators.ensureFieldIdAssignable(c.fieldId)
          Validators.ensureShapeIdExists(c.shapeId)
          Validators.ensureShapeIdCanAddField(c.shapeId)

          c.shapeDescriptor match {
            case s: FieldShapeFromParameter => {
              Validators.ensureShapeParameterIdExists(s.shapeParameterId)
              Validators.ensureShapeIdIsParentOfParameterId(c.shapeId, s.shapeParameterId)
            }
            case s: FieldShapeFromShape => {
              Validators.ensureShapeIdExists(s.shapeId)
            }
          }

          persist(Events.FieldAdded(c.fieldId, c.shapeId, c.name, c.shapeDescriptor, eventContext))
        }

        case c: RemoveField => {
          Validators.ensureFieldIdExists(c.fieldId)
          persist(Events.FieldRemoved(c.fieldId, eventContext))
        }

        case c: RenameField => {
          Validators.ensureFieldIdExists(c.fieldId)
          persist(Events.FieldRenamed(c.fieldId, c.name, eventContext))
        }

        ////////////////////////////////////////////////////////////////////////////////

        case c: SetFieldShape => {
          c.shapeDescriptor match {
            case s: FieldShapeFromParameter => {
              Validators.ensureFieldIdExists(s.fieldId)
              Validators.ensureShapeParameterIdExists(s.shapeParameterId)
              val f = state.fields(s.fieldId)
              Validators.ensureShapeIdIsParentOfParameterId(f.descriptor.shapeId, s.shapeParameterId)
            }
            case s: FieldShapeFromShape => {
              Validators.ensureFieldIdExists(s.fieldId)
              Validators.ensureShapeIdExists(s.shapeId)
            }
          }
          persist(Events.FieldShapeSet(c.shapeDescriptor, eventContext))
        }

        ////////////////////////////////////////////////////////////////////////////////

        case c: AddShapeParameter => {
          Validators.ensureShapeIdExists(c.shapeId)
          Validators.ensureShapeParameterIdAssignable(c.shapeParameterId)
          Validators.ensureParametersCanBeChanged(c.shapeId)
          persist(Events.ShapeParameterAdded(c.shapeParameterId, c.shapeId, c.name, ProviderInShape(c.shapeId, NoProvider(), c.shapeParameterId), eventContext))
        }

        case c: RemoveShapeParameter => {
          Validators.ensureShapeParameterIdExists(c.shapeParameterId)
          Validators.ensureParameterCanBeRemoved(c.shapeParameterId)
          persist(Events.ShapeParameterRemoved(c.shapeParameterId, eventContext))
        }

        case c: RenameShapeParameter => {
          Validators.ensureShapeParameterIdExists(c.shapeParameterId)
          persist(Events.ShapeParameterRenamed(c.shapeParameterId, c.name, eventContext))
        }

        ////////////////////////////////////////////////////////////////////////////////

        case c: SetParameterShape => {
          c.shapeDescriptor match {
            case s: NoProvider => {}
            case s: ProviderInShape => {
              Validators.ensureShapeIdExists(s.shapeId)
              Validators.ensureShapeParameterIdExists(s.consumingParameterId)
              s.providerDescriptor match {
                case p: ShapeProvider => {
                  Validators.ensureShapeIdExists(p.shapeId)
                }
                case p: ParameterProvider => {
                  Validators.ensureShapeParameterIdExistsForShapeId(s.shapeId, p.shapeParameterId)
                }
              }
            }
            case s: ProviderInField => {
              Validators.ensureFieldIdExists(s.fieldId)
              Validators.ensureShapeParameterIdExists(s.consumingParameterId)
              s.providerDescriptor match {
                case p: ShapeProvider => {
                  Validators.ensureShapeIdExists(p.shapeId)
                }
                case p: ParameterProvider => {
                  val f = state.fields(s.fieldId)
                  Validators.ensureShapeIdIsParentOfParameterId(f.descriptor.shapeId, p.shapeParameterId)
                }
              }
            }
          }

          persist(Events.ShapeParameterShapeSet(c.shapeDescriptor, eventContext))
        }
        ////////////////////////////////////////////////////////////////////////////////

      }
    }
  }

  override def applyEvent(event: ShapesEvent, state: ShapesState): ShapesState = {
    event match {

      ////////////////////////////////////////////////////////////////////////////////

      case e: ShapeAdded => {
        state.withShape(e.shapeId, e.baseShapeId, e.parameters, e.name)
      }

      case e: ShapeRenamed => {
        state.withShapeName(e.shapeId, e.name)
      }

      case e: BaseShapeSet => {
        state.withBaseShape(e.shapeId, e.baseShapeId)
      }

      case e: ShapeRemoved => {
        state.withoutShape(e.shapeId)
      }

      ////////////////////////////////////////////////////////////////////////////////

      case e: FieldAdded => {
        state.withField(e.fieldId, e.shapeId, e.name, e.shapeDescriptor)
      }

      case e: FieldRenamed => {
        state.withFieldName(e.fieldId, e.name)
      }

      case e: FieldRemoved => {
        state.withoutField(e.fieldId)
      }

      case e: FieldShapeSet => {
        state.withFieldShape(e.shapeDescriptor)
      }
      ////////////////////////////////////////////////////////////////////////////////


      ////////////////////////////////////////////////////////////////////////////////

      case e: ShapeParameterAdded => {
        state.withShapeParameter(e.shapeParameterId, e.shapeId, e.shapeDescriptor, e.name)
      }

      case e: ShapeParameterRenamed => {
        state.withShapeParameterName(e.shapeParameterId, e.name)
      }

      case e: ShapeParameterRemoved => {
        state.withoutShapeParameter(e.shapeParameterId)
      }

      case e: ShapeParameterShapeSet => {
        state.withShapeParameterShape(e.shapeDescriptor)
      }

      ////////////////////////////////////////////////////////////////////////////////
    }
  }

  def CoreShape(shapeId: String, shapeParametersDescriptor: ShapeParametersDescriptor, name: String) = {
    ShapeEntity(shapeId, ShapeValue(isUserDefined = false, shapeId, shapeParametersDescriptor, Seq.empty, name), isRemoved = false)
  }

  override def initialState: ShapesState = {
    val anyShape = CoreShape("$any", NoParameterList(), "Any")
    val stringShape = CoreShape("$string", NoParameterList(), "string")
    val booleanShape = CoreShape("$boolean", NoParameterList(), "bool")
    val numberShape = CoreShape("$number", NoParameterList(), "number")
    val unknownShape = CoreShape("$unknown", NoParameterList(), "unknown")

    val listShapeId = "$list"
    val listItemParameter = ShapeParameterEntity("$listItem", ShapeParameterValue(listShapeId, ProviderInShape(listShapeId, NoProvider(), "$listItem"), "T"), isRemoved = false)
    val listShape = CoreShape(listShapeId, StaticParameterList(Seq(listItemParameter.shapeParameterId)), "List")

    val mapShapeId = "$map"
    val mapKeyParameter = ShapeParameterEntity("$mapKey", ShapeParameterValue(mapShapeId, ProviderInShape(mapShapeId, NoProvider(), "$mapKey"), "K"), isRemoved = false)
    val mapValueParameter = ShapeParameterEntity("$mapValue", ShapeParameterValue(mapShapeId, ProviderInShape(mapShapeId, NoProvider(), "$mapValue"), "V"), isRemoved = false)
    val mapShape = CoreShape(mapShapeId, StaticParameterList(Seq(mapKeyParameter.shapeParameterId, mapValueParameter.shapeParameterId)), "Map")

    val entityIdentifierShapeId = "$identifier"
    val entityIdentifierParameter = ShapeParameterEntity("$identifierInner", ShapeParameterValue(entityIdentifierShapeId, ProviderInShape(entityIdentifierShapeId, NoProvider(), "$identifierInner"), "T"), isRemoved = false)
    val entityIdentifierShape = CoreShape(entityIdentifierShapeId, StaticParameterList(Seq(entityIdentifierParameter.shapeParameterId)), "Identifier")

    val entityReferenceShapeId = "$reference"
    val entityReferenceParameter = ShapeParameterEntity("$referenceInner", ShapeParameterValue(entityReferenceShapeId, ProviderInShape(entityReferenceShapeId, NoProvider(), "$referenceInner"), "T"), isRemoved = false)
    val entityReferenceShape = CoreShape(entityReferenceShapeId, StaticParameterList(Seq(entityReferenceParameter.shapeParameterId)), "Reference")

    val valueObjectShapeId = "$object"
    val valueObjectShape = CoreShape(valueObjectShapeId, DynamicParameterList(Seq.empty), "Object")

    val oneOfShapeId = "$oneOf"
    val oneOfShape = CoreShape(oneOfShapeId, DynamicParameterList(Seq.empty), "OneOf")

    val optionalShapeId = "$optional"
    val optionalParameter = ShapeParameterEntity(OptionalKind.innerParam, ShapeParameterValue(optionalShapeId, ProviderInShape(optionalShapeId, NoProvider(), OptionalKind.innerParam), "T"), isRemoved = false)
    val optionalShape = CoreShape(optionalShapeId, StaticParameterList(Seq(optionalParameter.shapeParameterId)), "Optional")

    val nullableShapeId = "$nullable"
    val nullableParameter = ShapeParameterEntity("$nullableInner", ShapeParameterValue(nullableShapeId, ProviderInShape(nullableShapeId, NoProvider(), "$nullableInner"), "T"), isRemoved = false)
    val nullableShape = CoreShape(nullableShapeId, StaticParameterList(Seq(nullableParameter.shapeParameterId)), "Nullable")


    val shapes = Map(
      anyShape.shapeId -> anyShape,
      stringShape.shapeId -> stringShape,
      numberShape.shapeId -> numberShape,
      booleanShape.shapeId -> booleanShape,
      listShape.shapeId -> listShape,
      mapShape.shapeId -> mapShape,
      entityIdentifierShape.shapeId -> entityIdentifierShape,
      entityReferenceShape.shapeId -> entityReferenceShape,
      valueObjectShape.shapeId -> valueObjectShape,
      oneOfShape.shapeId -> oneOfShape,
      nullableShape.shapeId -> nullableShape,
      optionalShape.shapeId -> optionalShape,
      unknownShape.shapeId -> unknownShape
    )

    val shapeParameters = Map(
      listItemParameter.shapeParameterId -> listItemParameter,
      mapKeyParameter.shapeParameterId -> mapKeyParameter,
      mapValueParameter.shapeParameterId -> mapValueParameter,
      entityIdentifierParameter.shapeParameterId -> entityIdentifierParameter,
      entityReferenceParameter.shapeParameterId -> entityReferenceParameter,
      nullableParameter.shapeParameterId -> nullableParameter,
      optionalParameter.shapeParameterId -> optionalParameter,
    )

    val fields = ListMap.empty[FieldId, FieldEntity]
    val fieldBindings = Map.empty[FieldId, Map[ShapeParameterId, ProviderDescriptor]]
    val parameterBindings = Map.empty[ShapeParameterId, Map[ShapeParameterId, ProviderDescriptor]]

    ShapesState(
      shapes,
      parameterBindings,
      shapeParameters,
      fields,
      fieldBindings
    )
  }
}
