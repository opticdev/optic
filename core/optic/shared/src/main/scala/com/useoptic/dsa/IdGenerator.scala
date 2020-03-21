package com.useoptic.dsa

import scala.util.Random

trait IdGenerator[T] {
  def nextId(): T
}

class SequentialIdGenerator(prefix: String = "", delimiter: String = "") extends IdGenerator[String] {
  val source = Stream.from(1, 1).iterator

  override def nextId(): String = {
    val currentValue = source.next()
    s"${prefix}${delimiter}${currentValue}"
  }
}

class RandomAlphanumericIdGenerator(prefix: String = "", delimiter: String = "", length: Int = 10) extends IdGenerator[String] {
  override def nextId(): String = {
    val currentValue = (Random.alphanumeric take length).mkString
    s"${prefix}${delimiter}${currentValue}"
  }
}