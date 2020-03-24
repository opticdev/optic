package com.useoptic.serialization

import com.useoptic.types.capture.{HttpInteraction, ShapeHashBytes}
import io.circe.{Decoder, Json}

object InteractionSerialization {
  def fromJson(json: Json): HttpInteraction = {
    import io.circe.generic.auto._
    implicit val shapeHashDecoder: Decoder[ShapeHashBytes] = (json) => {
      Right(ShapeHashBytes(json.downField("bytes").downField("data").as[Vector[Byte]].right.get))
    }
    json.as[HttpInteraction].right.get
  }
}
