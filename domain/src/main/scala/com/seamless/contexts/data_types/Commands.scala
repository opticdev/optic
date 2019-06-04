package com.seamless.contexts.data_types
import com.seamless.ddd.{AggregateId, ExportedCommand}
import com.seamless.contexts.data_types.Primitives._
import com.seamless.contexts.rfc.Commands.RfcCommand

object Commands {
  sealed trait DataTypesCommand extends RfcCommand with ExportedCommand
  type ConceptId = String
  type FieldId = String
  type TypeParameterId = String
  type ShapeId = String

  //Commands
  case class DefineConcept(name: String, root: String, conceptId: ConceptId) extends DataTypesCommand
  case class SetConceptName(newName: String, conceptId: ConceptId) extends DataTypesCommand
  case class DeprecateConcept(conceptId: ConceptId) extends DataTypesCommand

  case class DefineInlineConcept(root: String, conceptId: ConceptId) extends DataTypesCommand

  case class AssignType(id: String, to: PrimitiveType, conceptId: ConceptId) extends DataTypesCommand
  case class AddField(parentId: String, id: FieldId, conceptId: ConceptId) extends DataTypesCommand
  case class RemoveField(id: FieldId, conceptId: ConceptId) extends DataTypesCommand
  case class SetFieldName(id: FieldId, newName: String, conceptId: ConceptId) extends DataTypesCommand
  case class SetFieldOccurrence(id: FieldId, optional: Boolean, conceptId: ConceptId) extends DataTypesCommand

  case class AddTypeParameter(parentId: String, id: TypeParameterId, conceptId: ConceptId) extends DataTypesCommand
  case class RemoveTypeParameter(id: TypeParameterId, conceptId: ConceptId) extends DataTypesCommand

}
