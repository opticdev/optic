package com.opticdev.core.sourcegear

import java.nio.ByteBuffer

object GearSerialization {

//  implicit class ParserGearSerialization(val parser: ParseGear) extends SourceGearDeserializable[ParseGear]

}

trait SourceGearSerializable[T] {
  val gear : T
  def serialize: ByteBuffer
}

trait SourceGearDeserializable[T] {
  def fromData(buf: ByteBuffer) : T
}