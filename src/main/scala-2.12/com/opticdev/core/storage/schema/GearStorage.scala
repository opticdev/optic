package com.opticdev.core.storage.schema

import java.nio.ByteBuffer

import better.files.File
import com.opticdev.core.sdk.descriptions.{Schema, SchemaId}
import com.opticdev.core.sourcegear.Gear
import com.opticdev.core.storage.DataDirectory
import play.api.libs.json.Json
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.gears.parsing.ParseAsModel
import boopickle.Default._
import com.opticdev.core.sourcegear.serialization.PickleImplicits._
import scala.util.Try

object GearStorage {
  //@todo this has to come from preferences...
  implicit val rulesProvider = new RuleProvider()

  def writeToStorage(gear: Gear): File = {
//    val file = DataDirectory.compiled / gear.identifier  createIfNotExists(asDirectory = false)
//    val bytes = Pickle.intoBytes(gear.generater)
//    file.writeByteArray(bytes.array())
    null
  }

  def loadFromStorage(gearId: String) : Option[Gear] = {

    val file = DataDirectory.compiled / gearId
    if (file.exists) {
//      val gearParse = Try(Unpickle[Gear].fromBytes(ByteBuffer.wrap(file.byteArray)))
//      if (gearParse.isSuccess) Option(gearParse.get) else None
      None
    } else {
      None
    }
  }

}
