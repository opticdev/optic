package com.useoptic.dsa

import scala.util.Random

class IdGenerator(prefix: String = "", delimiter: String = "")(implicit randomness: Randomness) {
  def nextId(): String = {
    val currentValue = randomness.next
    s"${prefix}${delimiter}${currentValue}"
  }
}


abstract class Randomness {
  def next: String
}

object Randomness {
  def forTesting(prefix: String): Randomness = new Randomness {
    private val source = Stream.from(1, 1).iterator
    override def next: String = source.next().toString
  }

  def forProduction: Randomness = new Randomness {
    override def next: String = (Random.alphanumeric take 10).mkString
  }
}
