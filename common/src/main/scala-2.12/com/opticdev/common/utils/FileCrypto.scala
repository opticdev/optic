package com.opticdev.parsers.utils

object FileCrypto {
  def hashFile(filePath: String): String = {
    val lines = scala.io.Source.fromFile(filePath).mkString
    Crypto.createSha1(lines)
  }

  def sha256Hash(text: String) : String = String.format("%064x", new java.math.BigInteger(1, java.security.MessageDigest.getInstance("SHA-256").digest(text.getBytes("UTF-8"))))

  def hashString(raw: String) = Crypto.createSha1(raw)
}
