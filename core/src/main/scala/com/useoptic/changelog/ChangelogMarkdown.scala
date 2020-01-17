package com.useoptic.changelog

import com.useoptic.changelog.Changelog.{AddedRequest, AddedResponse, Change, FieldShapeChange, ListItemTypeChanged, NewField, RemovedField, ShapeChange}
import com.useoptic.contexts.requests.Commands.RequestId
import com.useoptic.contexts.rfc.projections.ContributionsProjection
import com.useoptic.ddd.CachedProjection
import com.useoptic.utilities.DocBuilder

class ChangelogMarkdown(addedRequests: Vector[AddedRequest], updatedRequests: Map[RequestId, Vector[Change]], changelogInput: ChangelogInput) extends DocBuilder {

  // Helpers
  val headContributions = new CachedProjection(ContributionsProjection, changelogInput.headEvents).withEvents(changelogInput.headEvents)
  def getHeadContribution(id: String, key: String) = headContributions.get(id, key)


  def renderChange(change: Change) = change match {
    case AddedResponse(statusCode, _) => li(s"Added ${statusCode} Response")
    case NewField(key, typeString, tag, trail, context) => li(s"${code(key)} added as ${code(typeString)} ${trail.asStringWithIn}")
    case RemovedField(_, key, tag, trail, context) => li(s"${code(key)} removed ${trail.asStringWithIn}")
    case FieldShapeChange(_, key, oldType, newType, tag, trail, context) => li(s"${code(key)} changed from ${code(oldType)} to ${code(newType)} ${trail.asStringWithIn}")
    case ShapeChange(_, oldType, newType, tag, trail, context) => li(s"${trail.asString} changed from ${code(oldType)} to ${code(newType)}")
    case ListItemTypeChanged(_, oldType, newType, tag, trail, context) => li(s"${trail.asString} list items changed from ${code(oldType)} to ${code(newType)}")
    case _ => println("No template for " +change.toString)
  }

  def renderChanges(requestId: RequestId, changes: Vector[Change]) = {

    println(requestId)
    h3(getHeadContribution(requestId, "purpose").get)

    val requestChangeLog = changes.collect{ case c if c.context.isInstanceOf[InRequest] => c}

    if (requestChangeLog.nonEmpty) {
      h5("Request")
      changes.foreach(change => renderChange(change))
    }

    val responseChangesSortedByStatusCode = changes.collect{ case c if c.context.isInstanceOf[InResponse] => c}.groupBy(_.context.asInstanceOf[InResponse].statusCode)

    responseChangesSortedByStatusCode.toVector.sortBy(_._1).foreach{ case (statusCode, changes) => {
      h5(s"${statusCode.toString} Response")

      changes.foreach(change => renderChange(change))
    }}
  }


  // Body
  p("Hey, Optic here! Here are the API changes for this commit:")

  val updatesThatBreakTheAPI = updatedRequests.filter(i => i._2.exists(_.tag.isInstanceOf[Breaking]))
  if (updatesThatBreakTheAPI.nonEmpty) {
    h2("Breaking Changes")
  } else {
    h4("No breaking changes \uD83D\uDC4D")
  }

  val allOtherUpdates = updatedRequests.filterNot(i => updatesThatBreakTheAPI.contains(i._1))

  if (allOtherUpdates.nonEmpty) {
    h2(s"Updated Requests (${allOtherUpdates.size})")
    allOtherUpdates.map { case (requestId, requestChanges) => renderChanges(requestId, requestChanges) }

  }

  if (addedRequests.nonEmpty) {
    h2(s"New Requests (${addedRequests.size})")
    addedRequests.map(newRequest => {
      li(s"${getHeadContribution(newRequest.requestId, "purpose").get}")


    })
  }


}
