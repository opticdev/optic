package com.opticdev.core.sourcegear.storage

import java.io.FileNotFoundException
import java.nio.ByteBuffer

import better.files.File
import boopickle.Default._
import com.opticdev.common.storage.DataDirectory
import com.opticdev.core.sourcegear.Gear
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.serialization.PickleImplicits._

import scala.util.{Failure, Try}

object GearStorage {
  //@todo this has to come from preferences...
  implicit val rulesProvider = new RuleProvider()

  def writeToStorage(gear: Gear): File = {
    val file = DataDirectory.compiled / gear.name  createIfNotExists(asDirectory = false)

    val bytes = Pickle.intoBytes(gear)
    file.writeByteArray(bytes.array())
  }

  def loadFromStorage(gearId: String) : Try[Gear] = {

    val file = DataDirectory.compiled / gearId
    if (file.exists) {
      val gearParse = Try(Unpickle[Gear].fromBytes(ByteBuffer.wrap(file.byteArray)))
      gearParse
    } else {
      Failure(new FileNotFoundException())
    }
  }

}
