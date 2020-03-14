package com.useoptic.serialization

trait StableHashable {
  def toHash()(implicit hasher: String => String): String = {
    hasher(this.toString)
  }
}
