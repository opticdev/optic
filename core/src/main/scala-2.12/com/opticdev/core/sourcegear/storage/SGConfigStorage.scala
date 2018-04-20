package com.opticdev.core.sourcegear.storage

import java.io.FileNotFoundException
import java.nio.ByteBuffer

import better.files.File
import boopickle.Default._
import com.opticdev.common.storage.DataDirectory
import com.opticdev.core.sourcegear.{CompiledLens, SGConfig}
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.serialization.PickleImplicits._
import com.opticdev.opm.DependencyTree

import scala.util.{Failure, Try}

object SGConfigStorage {
  //@todo this has to come from preferences...
  implicit val rulesProvider = new RuleProvider()

  def writeToStorage(sgConfig: SGConfig, projectFileHash: String): File = {
    val file = DataDirectory.sourcegear / projectFileHash  createIfNotExists(asDirectory = false)
    val bytes = Pickle.intoBytes(sgConfig)
    file.writeByteArray(bytes.array())
  }

  def loadFromStorage(hashString: String) : Try[SGConfig] = {

    val file = DataDirectory.sourcegear / hashString
    if (file.exists) {
      Try(Unpickle[SGConfig].fromBytes(ByteBuffer.wrap(file.byteArray)))
    } else {
      Failure(new FileNotFoundException(file.pathAsString))
    }
  }

}
