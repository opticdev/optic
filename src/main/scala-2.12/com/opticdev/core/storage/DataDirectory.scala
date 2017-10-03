package com.opticdev.core.storage

object DataDirectory {
  val root = PlatformConstants.dataDirectory

  val descriptions = PlatformConstants.dataDirectory / "descriptions"
  val compiled = PlatformConstants.dataDirectory / "compiled"
  val parsers = PlatformConstants.dataDirectory / "parsers"
  val schemas = PlatformConstants.dataDirectory / "schemas"


  def hasValidStructure = {
    root.isDirectory &&
      descriptions.isDirectory &&
      compiled.isDirectory &&
      parsers.isDirectory &&
      schemas.isDirectory
  }

  def buildDirectoryStructure = {
    root.createIfNotExists(asDirectory = true)
    descriptions.createIfNotExists(asDirectory = true)
    compiled.createIfNotExists(asDirectory = true)
    parsers.createIfNotExists(asDirectory = true)
    schemas.createIfNotExists(asDirectory = true)
  }

  def delete = root.delete(true)

  def reset = {
    delete
    buildDirectoryStructure
  }

}
