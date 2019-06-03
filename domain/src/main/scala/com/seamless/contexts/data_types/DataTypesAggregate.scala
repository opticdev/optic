package com.seamless.contexts.data_types

import Events.DataTypesEvent
import com.seamless.contexts.data_types.Commands._
import com.seamless.contexts.data_types.Primitives._
import com.seamless.ddd.{AggregateId, Effects, EventSourcedAggregate}

object DataTypesAggregate extends EventSourcedAggregate[DataTypesState, DataTypesCommand, DataTypesEvent] {

  override def handleCommand(_state: DataTypesState): PartialFunction[DataTypesCommand, Effects[DataTypesEvent]] = {

    implicit val state = _state

    {
      case DefineConcept(name, root, conceptId) => {
        Validators.idIsUnused(conceptId, "Concept ID")
        Validators.idIsUnused(root, "Root Schema ID")
        persist(Events.ConceptDefined(name, root, conceptId))
      }

      case AddField(parentId, id, conceptId) => {
        Validators.idIsUnused(id, "Field ID")
        Validators.idExistsForSchema(parentId, conceptId)
        Validators.requireIdType(parentId, ObjectT, "to create a field")
        persist(Events.FieldAdded(parentId, id, conceptId))
      }
      case RemoveField(fieldId, conceptId) => {
        Validators.isValidField(fieldId)
        Validators.idExistsForSchema(fieldId, conceptId)
        persist(Events.FieldRemoved(fieldId, conceptId))
      }
      case SetFieldName(id, newName, conceptId) => {
        Validators.idExistsForSchema(id, conceptId)
        persist(Events.FieldNameChanged(id, newName, conceptId))
      }
      case AssignType(id, newType, conceptId) => {
        Validators.idExistsForSchema(id, conceptId)
        Validators.refTypeExists(newType)
        persist(Events.TypeAssigned(id, newType, conceptId))
      }

      case AddTypeParameter(parentId, id, conceptId) => {
        Validators.idIsUnused(id, "Concept ID")
        Validators.requireIdTakesTypeParameters(parentId, "add a new type parameter")
        Validators.idExistsForSchema(parentId, conceptId)
        persist(Events.TypeParameterAdded(parentId, id, conceptId))
      }
      case RemoveTypeParameter(id, conceptId) => {
        Validators.isValidTypeParameter(id)
        Validators.idExistsForSchema(id, conceptId)
        persist(Events.TypeParameterRemoved(id, conceptId))
      }
      case _ => noEffect()
    }
  }


  override def applyEvent(event: DataTypesEvent, state: DataTypesState): DataTypesState = event match {
    case Events.ConceptDefined(name, rootId, conceptId) => {
      state.update(
        s => s.putConceptId(conceptId, ConceptDescription(name, rootId)),
        s => {
          s.putId(rootId, ShapeDescription(ObjectT, null, conceptId, None, Some(Seq())))
        }
      )
    }
    case Events.FieldAdded(parentId, id, conceptId) => {
      state.update(
        s => s.putId(id, ShapeDescription(StringT, parentId, conceptId, key = Some(""))),
        s => {
          val parentObj = state.components(parentId).appendField(id)
          s.putId(parentId, parentObj)
        }
      )
    }
    case Events.FieldNameChanged(fieldId, newName, conceptId) => {
      state.updateField(fieldId)(field => field.copy(key = Some(newName)))
    }

    case Events.TypeAssigned(id, newType, conceptId) => {
      val pastFields = state.getPastFields(id)
      state.putId(id, state.components(id).updateType(newType, pastFields))
    }

    case Events.FieldRemoved(fieldId, conceptId) => {
      val description = state.components(fieldId)
      state.update(
        s => s.deleteId(fieldId),
        s => {
          val parentObj = s.components(description.parentId).removeField(fieldId)
          s.putId(description.parentId, parentObj)
        }
      )
    }

    case Events.TypeParameterAdded(parentId, id, conceptId) => {
      state.update(
        s => s.putId(id, ShapeDescription(StringT, parentId, conceptId, None)),
        s => {
          val parentObj = state.components(parentId).appendTypeParameter(id)
          s.putId(parentId, parentObj)
        }
      )
    }

    case Events.TypeParameterRemoved(id, conceptId) => {
      val description = state.components(id)
      state.update(
        s => s.deleteId(id),
        s => {
          val parentObj = s.components(description.parentId).removeTypeParameter(id)
          s.putId(description.parentId, parentObj)
        }
      )
    }
  }

  override def initialState: DataTypesState = DataTypesState(Map(), Map())
}
