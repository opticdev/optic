package com.useoptic.common.spec_types.diff

object DiffUtils {

  case class Diff[A](added: Set[A], removed: Set[A], same: Set[A])

  def keyDiff[A, B](a: Set[A], b: Set[A])(unique: A => B): Diff[B] = {
    val aKeys = a.map(unique)
    val bKeys = b.map(unique)

    Diff(
      bKeys diff aKeys,
      aKeys diff bKeys,
      aKeys intersect bKeys)
  }

}
