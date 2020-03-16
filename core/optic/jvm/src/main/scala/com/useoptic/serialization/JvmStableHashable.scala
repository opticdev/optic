package com.useoptic.serialization

import java.security.MessageDigest

/*
From JVM side, you need to add this to the scope of the Diff function
implicit val hasher = StableHashable.forJvm
Then you can run:
diff.toHash
 */
object JvmStableHashable {
  def convertBytesToHex(bytes: Seq[Byte]): String = {
    val sb = new StringBuilder
    for (b <- bytes) {
      sb.append(String.format("%02x", Byte.box(b)))
    }
    sb.toString
  }

  def hash = (s: String) => {
    convertBytesToHex(MessageDigest.getInstance("SHA-1").digest((s).getBytes))
  }
}