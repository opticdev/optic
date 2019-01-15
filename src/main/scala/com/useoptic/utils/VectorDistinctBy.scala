package com.useoptic.utils

object VectorDistinctBy {

  implicit def distinctBy[L, E](vec: Vector[L])(f: L => E): Vector[L] =
    vec.foldLeft((Vector.empty[L], Set.empty[E])) {
      case ((acc, set), item) =>
        val key = f(item)
        if (set.contains(key)) (acc, set)
        else (acc :+ item, set + key)
    }._1

}
