package com.useoptic.changelog

import com.useoptic.changelog.Changelog.{Change, _}
import com.useoptic.contexts.requests.Commands.{RequestId, ResponseId}
import com.useoptic.contexts.shapes.Commands.{FieldId, ShapeId}
import com.useoptic.diff.ShapeTrail

object Changelog {
  sealed trait Change { def context: ChangelogContext; def tag: ChangeTag }

  // Entry Points
  case class AddedRequest(path: String, method: String, requestId: RequestId) extends Change {override def context: ChangelogContext = EntryPoint(); override def tag: ChangeTag = Addition}
  case class RemovedRequest(path: String, method: String, requestId: RequestId) extends Change {override def context: ChangelogContext = EntryPoint(); override def tag: ChangeTag = Breaking("Clients using this request will be broken") }

  case class AddedResponse(statusCode: Int, context: ChangelogContext) extends Change {override def tag: ChangeTag = Addition}
  case class ChangedContentType(from: String, to: String, context: ChangelogContext) extends Change {override def tag: ChangeTag = Breaking("Content Type Changed")}

  //Shapes
  case class NewField(key: String, typeString: String, tag: ChangeTag, trail: ShapeTrail, context: ChangelogContext) extends Change
  case class RemovedField(fieldId: FieldId, key: String, tag: ChangeTag, trail: ShapeTrail, context: ChangelogContext) extends Change
  case class FieldShapeChange(fieldId: String, key: String, oldType: String, newType: String, tag: ChangeTag, trail: ShapeTrail, context: ChangelogContext) extends Change
  case class ShapeChange(shapeId: ShapeId, oldType: String, newType: String, tag: ChangeTag, trail: ShapeTrail, context: ChangelogContext) extends Change
  case class ListItemTypeChanged(listId: ShapeId, oldType: String, newType: String, tag: ChangeTag, trail: ShapeTrail, context: ChangelogContext) extends Change


  case class NoChange(context: ChangelogContext) extends Change {override def tag: ChangeTag = UnknownChange}
  case class UnhandledDiff(diff: String, context: ChangelogContext) extends Change {override def tag: ChangeTag = UnknownChange}
}

case class Changelog(addedRequests: Vector[AddedRequest],
                     removedRequests: Vector[RemovedRequest],
                     updatedRequests: Map[RequestId, Vector[Change]],
                     markdown: String) {
  def nonEmpty: Boolean = addedRequests.nonEmpty || removedRequests.nonEmpty || updatedRequests.nonEmpty
  def isEmpty: Boolean = !nonEmpty
}



// Context
trait ChangelogContext
case class InRequest(requestId: RequestId) extends ChangelogContext
case class InResponse(responseId: ResponseId, statusCode: Int)  extends ChangelogContext
case class EntryPoint() extends ChangelogContext
