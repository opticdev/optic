package com.opticdev.parsers.utils

import java.security.MessageDigest

object Crypto {
  def createSha256Hash(contentAsString: String) : String = String.format("%064x", new java.math.BigInteger(1, java.security.MessageDigest.getInstance("SHA-256").digest(contentAsString.getBytes("UTF-8"))))

  def createSha1(string: String) : String = MessageDigest.getInstance("SHA-1").digest(string.getBytes).mkString("")
}




