package com.opticdev.core.sourcegear.serialization

import java.nio.ByteBuffer

import better.files.File
import boopickle.Default._
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.gears.parsing.{ParseAsModel, ParseGear}

import scala.util.Try

object SerializeGears {
  import com.opticdev.core.sourcegear.serialization.PickleImplicits._

  implicit class ParseGearSerialization(gear: ParseAsModel) {
    implicit val ruleProvider: RuleProvider = gear.ruleProvider
    def serialize: ByteBuffer = Pickle.intoBytes[ParseAsModel](gear)
    def toFile(file: File) = Try(file.writeByteArray(serialize.array()))
  }

}


