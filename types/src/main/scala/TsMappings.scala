package com.useoptic.types

import com.useoptic.types.capture._
import io.circe.Json
import nl.codestar.scalatsi.TypescriptType.{TSNull, TSString}
import nl.codestar.scalatsi._


// A TSType[T] is what tells scala-tsi how to convert your type T into typescript
// MyModelTSTypes contains all TSType[_]'s for your model
// You can also spread these throughout your codebase, for example in the same place where your JSON (de)serializers
object MyTSTypes extends DefaultTSTypes {


  implicit val tsJson = TSType.sameAs[Json, Object]


  implicit val tsBody: TSType[Body] = TSType.interface("IBody",
    "asText" -> (TSString | TSNull),
    "asForm" -> (TSString.array | TSNull),
    "asJsonString" -> (TSString | TSNull)
  )


  implicit val tsHeader = TSType.fromCaseClass[Header]
  implicit val tsGrouping = TSType.fromCaseClass[GroupingIdentifiers]
  implicit val tsRequest = TSType.fromCaseClass[Request]
  implicit val tsResponse = TSType.fromCaseClass[Response]
  // TSType.fromCaseClass will convert your case class to a typescript definition
  // `- ssn` indicated the ssn field should be removed
  implicit val tsInteraction = TSType.fromCaseClass[ApiInteraction]
  implicit val tsCapture = TSType.fromCaseClass[Capture]
}
