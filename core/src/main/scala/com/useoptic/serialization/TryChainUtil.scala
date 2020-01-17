package com.useoptic.serialization

import scala.util.{Success, Try}

object TryChainUtil {

  def firstSuccessIn[A, B](input: A, funcs: (A => Try[B])*): Option[B] = {
    new Iterator[Try[B]] {
      private var _index = -1
      override def hasNext: Boolean = funcs.isDefinedAt(_index + 1)
      override def next(): Try[B] = {
        _index = _index + 1
        funcs(_index)(input)
      }
    }
    .collectFirst { case Success(x) => x }
  }

}
