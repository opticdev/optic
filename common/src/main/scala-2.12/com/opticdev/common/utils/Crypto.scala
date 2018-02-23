package com.opticdev.parsers.utils

import java.security.MessageDigest

object Crypto {
  def createSha1(string: String) : String = MessageDigest.getInstance("SHA-1").digest(string.getBytes).mkString("")
}




