package com.useoptic.types

import com.useoptic.types.capture.{ArbitraryData, Body, Capture, GroupingIdentifiers, HttpInteraction, HttpInteractionTag, Request, Response, ShapeHashBytes}
import io.circe.Json
import nl.codestar.scalatsi.TypescriptType.{TSNull, TSString}
import nl.codestar.scalatsi._


// A TSType[T] is what tells scala-tsi how to convert your type T into typescript
// MyModelTSTypes contains all TSType[_]'s for your model
// You can also spread these throughout your codebase, for example in the same place where your JSON (de)serializers
// TSType.fromCaseClass will convert your case class to a typescript definition
// `- ssn` indicated the ssn field should be removed
object MyTSTypes extends DefaultTSTypes {
  implicit val tsJson = TSType.sameAs[Json, Object]
  implicit  lazy val tsArbitraryData: TSType[ArbitraryData] = TSType.interface("IArbitraryData",
    "asShapeHashBytes" -> (tsShapeHashBytes | TSNull),
    "asJsonString" -> (TSString | TSNull),
    "asText" -> (TSString | TSNull)
  )

  implicit lazy val tsBody: TSType[Body] = TSType.interface("IBody",
    "contentType" -> (TSString | TSNull),
    "value" -> (tsArbitraryData.get)
  )
  implicit val tsInteractionTag = TSType.fromCaseClass[HttpInteractionTag]
  implicit val tsShapeHashBytes = TSType.fromCaseClass[ShapeHashBytes]
  implicit val tsResponse = TSType.fromCaseClass[Response]
  implicit val tsRequest = TSType.fromCaseClass[Request]
  implicit val tsInteraction = TSType.fromCaseClass[HttpInteraction]
  implicit val tsGrouping = TSType.fromCaseClass[GroupingIdentifiers]
  implicit val tsCapture = TSType.fromCaseClass[Capture]
}
