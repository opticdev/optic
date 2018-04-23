package com.opticdev.common.storage

import better.files.File
import com.opticdev.common.PlatformConstants

object DataDirectory {
  val root = PlatformConstants.dataDirectory

  val markdownCache = PlatformConstants.dataDirectory / "markdown-cache"
  val packages = PlatformConstants.dataDirectory / "packages"
  val parsers = PlatformConstants.dataDirectory / "parsers"
  val compiled = PlatformConstants.dataDirectory / "compiled"
  val sourcegear = PlatformConstants.dataDirectory / "sourcegear"
  val bin = PlatformConstants.dataDirectory / "bin"

  def hasValidStructure = {
    root.isDirectory &&
      markdownCache.isDirectory &&
      parsers.isDirectory &&
      packages.isDirectory &&
      compiled.isDirectory &&
      sourcegear.isDirectory
      bin.isDirectory
  }

  def buildDirectoryStructure = {
    root.createIfNotExists(asDirectory = true)
    markdownCache.createIfNotExists(asDirectory = true)
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

  def emptyFolder(file: File): Unit = {
    file.delete(true)
    file.createIfNotExists(asDirectory = true)
  }

  def clearCaches = {
    emptyFolder(packages)
    emptyFolder(sourcegear)
    emptyFolder(markdownCache)
  }

}
