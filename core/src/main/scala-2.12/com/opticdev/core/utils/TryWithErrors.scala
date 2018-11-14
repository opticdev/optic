package com.opticdev.core.utils

import scala.util.Try

case class TryWithErrors[R, E, M](result: Try[R], errors: Vector[E] = Vector(), errorMeta: Option[M] = None) {
  def isSuccess: Boolean = result.isSuccess && errors.isEmpty
  def isFailure: Boolean = result.isFailure
  def isPartialSuccess: Boolean = result.isSuccess && errors.nonEmpty
  def get: R = result.get
}
