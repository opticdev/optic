package com.useoptic.serialization

import com.useoptic.types.capture.{HttpInteraction, ShapeHashBytes}
import io.circe.{Decoder, Json}

object InteractionSerialization {
  implicit val shapeHashDecoder: Decoder[Option[ShapeHashBytes]] = (json) => {
    //only return bytes if it was not null, and able to parse them
    val either = json.downField("bytes").downField("data").as[Vector[Byte]].toOption.map(i => ShapeHashBytes(i))
    Right(either)
  }
  def fromJson(json: Json): HttpInteraction = {
    import io.circe.generic.auto._
    import shapeHashDecoder._
    json.as[HttpInteraction].right.get
  }
}
