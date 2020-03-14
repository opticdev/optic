package com.useoptic.diff

import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.shapes.projections.TrailTags
import com.useoptic.diff.ChangeType.ChangeType
import com.useoptic.diff.shapes.JsonTrail

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExportAll
case class InteractiveDiffInterpretation(
                                          //communication
                                          title: String, description: String,
                                          //domain
                                          commands: Seq[RfcCommand],
                                          //visualizations
                                          changeType: ChangeType, jsonTags: TrailTags[JsonTrail] = TrailTags.empty,
                                          goto: GotoPreview) {
  def changeTypeAsString: String = changeType.toString
}

object ChangeType extends Enumeration {
  type ChangeType = Value
  val Addition, Removal, Update = Value
}

case class GotoPreview(_requestContentType: Option[String] = None,
                       _responseStatusCode: Option[Int] = None,
                       _responseContentType: Option[String] = None) {

  @JSExport
  def requestContentType = _requestContentType.orNull
  @JSExport
  def responseStatusCode: Integer = _responseStatusCode.map(i => Integer.valueOf(i)).orNull
  @JSExport
  def responseContentType = _responseContentType.orNull

}

