package com.useoptic.serialization

object Base64EncoderDecode {
  def decodeString(raw: String): Vector[Byte] = java.util.Base64.getDecoder.decode(raw).toVector
}
