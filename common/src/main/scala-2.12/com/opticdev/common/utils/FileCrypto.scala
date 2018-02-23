package com.opticdev.parsers.utils

object FileCrypto {
  def hashFile(filePath: String): String = {
    val lines = scala.io.Source.fromFile(filePath).mkString
    Crypto.createSha1(lines)
  }

  def hashString(raw: String) = Crypto.createSha1(raw)
}
