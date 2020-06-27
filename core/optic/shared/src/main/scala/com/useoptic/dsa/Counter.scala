package com.useoptic.dsa

import scala.collection.mutable.Map
import scala.scalajs.js.annotation.JSExportAll

@JSExportAll
class Counter[T] {
  var counts: Map[T, Int] = Map()

  def getCount(key: T) = {
    counts.getOrElse(key, 0)
  }

  def increment(key: T, amount: Int = 1) = {
    counts.update(key, counts.getOrElse(key, 0) + amount)
  }

  def merge(counter: Counter[T]) = {
    counter.counts.foreach(item => {
      val (k, v) = item
      increment(k, v)
    })
  }
}
