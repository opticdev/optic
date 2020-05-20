package com.useoptic.utilities

object DistinctBy {

  implicit class DistinctBySeqLike[A, B](seq: Seq[A]) {
    def distinctBy(discriminator: A => B): Seq[A] = {
      distinctByIfDefined((i: A) => Some(discriminator(i)))
    }
    def distinctByIfDefined(discriminator: A => Option[B]): Seq[A] = {
      val seen = scala.collection.mutable.Set[B]()
      seq.filter(a => {
        val d = discriminator(a)

        if (d.isDefined) {
          if (seen.contains(d.get)) {
            false
          } else {
            seen += d.get
            true
          }
        } else {
          true
        }
      })
    }
  }

}
