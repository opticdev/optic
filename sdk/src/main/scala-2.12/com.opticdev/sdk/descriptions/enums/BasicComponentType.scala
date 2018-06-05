package com.opticdev.sdk.descriptions.enums

sealed trait BasicComponentType

case object NotSupported extends BasicComponentType
case object Token extends BasicComponentType
case object Literal extends BasicComponentType
case object ObjectLiteral extends BasicComponentType