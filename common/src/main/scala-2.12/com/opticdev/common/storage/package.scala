package com.opticdev.common


package object storage {
  trait OS
  case object Mac extends OS
  case object Windows extends OS
  case object Linux extends OS
}
