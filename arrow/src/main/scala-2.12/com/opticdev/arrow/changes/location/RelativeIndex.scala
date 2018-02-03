package com.opticdev.arrow.changes.location

sealed trait RelativeIndex

case class Index(int: Int) extends RelativeIndex
case object Last extends RelativeIndex
case object First extends RelativeIndex

