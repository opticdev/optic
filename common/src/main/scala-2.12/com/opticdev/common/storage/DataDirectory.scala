package com.opticdev.common.storage

object DataDirectory {
  val root = PlatformConstants.dataDirectory

  val packages = PlatformConstants.dataDirectory / "packages"
  val parsers = PlatformConstants.dataDirectory / "parsers"
  val compiled = PlatformConstants.dataDirectory / "compiled"


  def hasValidStructure = {
    root.isDirectory &&
      parsers.isDirectory &&
      packages.isDirectory
  }

  def buildDirectoryStructure = {
    root.createIfNotExists(asDirectory = true)
    parsers.createIfNotExists(asDirectory = true)
    packages.createIfNotExists(asDirectory = true)
    compiled.createIfNotExists(asDirectory = true)
  }

  def delete = root.delete(true)

  def reset = {
    delete
    buildDirectoryStructure
  }

}
