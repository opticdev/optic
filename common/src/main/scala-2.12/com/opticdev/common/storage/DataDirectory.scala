package com.opticdev.common.storage

import better.files.File
import com.opticdev.common.PlatformConstants

object DataDirectory {
  val root = PlatformConstants.dataDirectory

  val packages = PlatformConstants.dataDirectory / "packages"
  val parsers = PlatformConstants.dataDirectory / "parsers"
  val compiled = PlatformConstants.dataDirectory / "compiled"
  val sourcegear = PlatformConstants.dataDirectory / "sourcegear"
  val bin = PlatformConstants.dataDirectory / "bin"

  def hasValidStructure = {
    root.isDirectory &&
      parsers.isDirectory &&
      packages.isDirectory &&
      compiled.isDirectory &&
      sourcegear.isDirectory
      bin.isDirectory
  }

  def buildDirectoryStructure = {
    root.createIfNotExists(asDirectory = true)
    parsers.createIfNotExists(asDirectory = true)
    packages.createIfNotExists(asDirectory = true)
    compiled.createIfNotExists(asDirectory = true)
    sourcegear.createIfNotExists(asDirectory = true)
    bin.createIfNotExists(asDirectory = true)
  }

  def delete = root.delete(true)

  def reset = {
    delete
    buildDirectoryStructure
  }

  def init : File = {
    if (!hasValidStructure) {
      reset
    }

    DataDirectory.root
  }

}
