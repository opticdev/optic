package com.useoptic.diff.helpers

import com.useoptic.JsonHelper
import com.useoptic.diff.helpers.DiffHelpers.{DiffsGroupedByRegion, InteractionsGroupedByDiff}
import com.useoptic.diff.interactions.{InteractionDiffResult, UnmatchedRequestBodyContentType, UnmatchedRequestBodyShape, UnmatchedRequestMethod, UnmatchedRequestUrl, UnmatchedResponseBodyContentType, UnmatchedResponseBodyShape, UnmatchedResponseStatusCode}

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll}

import js.JSConverters._

@JSExport
@JSExportAll
case class DiffRegionsHelpers(diffsGroupedByRegion: DiffsGroupedByRegion) {
  def keys() = {
    JsonHelper.seqToJsArray(diffsGroupedByRegion.keys.toSeq)
  }

  def get(group: String) = {
    diffsGroupedByRegion.get(group).orUndefined
  }
}

@JSExport
@JSExportAll
case class DiffResultHelpers(interactionsGroupedByDiff: InteractionsGroupedByDiff) {
  def listRegions() = {
    val groupedKeys = interactionsGroupedByDiff.keys.groupBy(diff => {
      diff match {
        case d: UnmatchedRequestUrl => "request"
        case d: UnmatchedRequestMethod => "request"
        case d: UnmatchedRequestBodyContentType => "request-body"
        case d: UnmatchedRequestBodyShape => "request-body"
        case d: UnmatchedResponseStatusCode => s"response-${d.interactionTrail.statusCode()}"
        case d: UnmatchedResponseBodyContentType => s"response-body-${d.interactionTrail.statusCode()}"
        case d: UnmatchedResponseBodyShape => s"response-body-${d.interactionTrail.statusCode()}"
        case _ => throw new Error("unimplemented")
      }
    })

    DiffRegionsHelpers(groupedKeys)
  }

  def keys(): js.Any = {
    JsonHelper.seqToJsArray(interactionsGroupedByDiff.keySet.toSeq)
  }

  def get(diff: InteractionDiffResult) = {
    interactionsGroupedByDiff.get(diff).orUndefined
  }
}