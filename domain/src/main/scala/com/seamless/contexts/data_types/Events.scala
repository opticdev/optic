package com.seamless.contexts.data_types
import Primitives.PrimitiveType
import com.seamless.contexts.data_types.Commands.{ConceptId, FieldId, TypeParameterId}
import com.seamless.contexts.requests.Events.RequestsEvent
import com.seamless.contexts.rfc.Events.RfcEvent
object Events {

  sealed trait DataTypesEvent extends RfcEvent

  case class ConceptDefined(name: String, root: String, id: ConceptId) extends DataTypesEvent
  case class ConceptNamed(newName: String, conceptId: ConceptId) extends DataTypesEvent
  case class ConceptDeprecated(conceptId: ConceptId) extends DataTypesEvent

  case class InlineConceptDefined(root: String, conceptId: ConceptId) extends DataTypesEvent

  case class TypeAssigned(id: String, to: PrimitiveType, conceptId: ConceptId) extends DataTypesEvent

  case class FieldAdded(parentId: String, id: FieldId, conceptId: ConceptId) extends DataTypesEvent
  case class FieldRemoved(id: FieldId, conceptId: ConceptId) extends DataTypesEvent

  case class FieldNameChanged(id: FieldId, newName: String, conceptId: ConceptId) extends DataTypesEvent

  case class ChildOccurrenceUpdated(id: FieldId, parentId: ConceptId, to: Boolean, conceptId: ConceptId) extends DataTypesEvent

  case class TypeParameterAdded(parentId: FieldId, id: TypeParameterId, conceptId: ConceptId) extends DataTypesEvent
  case class TypeParameterRemoved(id: TypeParameterId, conceptId: ConceptId) extends DataTypesEvent

}
