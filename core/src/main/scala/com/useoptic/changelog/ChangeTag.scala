package com.useoptic.changelog

sealed trait ChangeTag

case class Breaking(message: String) extends ChangeTag
case object Compatible extends ChangeTag
case object Addition extends ChangeTag
case object UnknownChange extends ChangeTag
