package com.useoptic

import com.useoptic.types.capture.{HttpInteraction, ShapeHashBytes}
import com.useoptic.ux.DiffManager
import io.circe.Decoder

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
object DiffManagerFacade {
  def newFromInteractions(x: js.Array[js.Any]): DiffManager = {
    import io.circe.generic.auto._
    import io.circe.scalajs.convertJsToJson
    implicit val shapeHashDecoder: Decoder[ShapeHashBytes] = (json) => {
      Right(ShapeHashBytes(json.downField("bytes").downField("data").as[Vector[Byte]].right.get))
    }
    val interactions = convertJsToJson(x).right.get.as[Seq[HttpInteraction]].right.get
    new DiffManager(interactions)
  }

  def updateInteractions(x: js.Array[js.Any], diffManager: DiffManager): Unit = {
    import io.circe.generic.auto._
    import io.circe.scalajs.convertJsToJson
    implicit val shapeHashDecoder: Decoder[ShapeHashBytes] = (json) => {
      Right(ShapeHashBytes(json.downField("bytes").downField("data").as[Vector[Byte]].right.get))
    }
    val interactions = convertJsToJson(x).right.get.as[Seq[HttpInteraction]].right.get
    diffManager.updateInteractions(interactions)
  }
}
