package com.opticdev.core.sourcegear.serialization

import java.nio.ByteBuffer

import better.files.File
import com.opticdev.core.sourcegear.gears.parsing.{ParseAsModel, ParseGear}
import boopickle.Default._
import com.opticdev.core.sourcegear.gears.RuleProvider

import scala.util.Try
import com.opticdev.core.sourcegear.serialization.PickleImplicits._

object GearLoader {

  //@todo this has to come from elsewhere...
  implicit val rulesProvider = new RuleProvider()

  def parseGearFromFile(file: File) : Try[ParseAsModel] =
    Try(Unpickle[ParseAsModel].fromBytes(ByteBuffer.wrap(file.byteArray)))
}
