package com.opticdev.cli

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import com.opticdev.common.SchemaRef
import com.opticdev.sdk.opticmarkdown2.LensRef
import play.api.libs.json.{JsObject, Json}
import SchemaRef._
import LensRef._

package object commands {
  val baseUrl = "https://localhost:30333"
  implicit val actorSystem = ActorSystem("cli-system")
  implicit val materializer = ActorMaterializer()


  implicit val dumpGraphOutputFormats = Json.format[DumpGraphOutput]

  case class DumpGraphOutput(name: Option[String],
                             schemaRef: SchemaRef,
                             lensRef: LensRef,
                             value: JsObject,
                             inFile: String)

}
