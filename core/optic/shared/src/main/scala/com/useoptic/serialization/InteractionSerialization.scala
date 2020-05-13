package com.useoptic.serialization

import com.useoptic.types.capture.{HttpInteraction}
import io.circe.{Decoder, Json}

object InteractionSerialization {
  def fromJson(json: Json): HttpInteraction = {
    import io.circe.generic.auto._
    json.as[HttpInteraction].right.get
  }
}
