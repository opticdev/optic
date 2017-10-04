package com.opticdev.core.storage.stores

import java.io.FileNotFoundException
import java.nio.ByteBuffer

import better.files.File
import com.opticdev.core.sdk.descriptions.{Schema, SchemaId}
import com.opticdev.core.sourcegear.Gear
import com.opticdev.core.storage.DataDirectory
import play.api.libs.json.Json
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.gears.parsing.{NodeDescription, ParseAsModel}
import boopickle.Default._
import com.opticdev.core.sourcegear.serialization.PickleImplicits._
import com.opticdev.parsers.LanguageId

import scala.util.{Failure, Success, Try}

object GearStorage {
  //@todo this has to come from preferences...
  implicit val rulesProvider = new RuleProvider()

  def writeToStorage(gear: Gear): File = {
    val file = DataDirectory.compiled / gear.identifier  createIfNotExists(asDirectory = false)

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
