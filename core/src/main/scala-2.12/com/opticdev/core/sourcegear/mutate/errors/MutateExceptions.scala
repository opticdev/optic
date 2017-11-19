package com.opticdev.core.sourcegear.mutate.errors

import com.opticdev.sdk.descriptions.Component

trait MutateException extends Exception


case class ComponentNotFound(propertyPath: String) extends MutateException {
  override def toString = "Component not found for property path "+propertyPath
}

case class AstMappingNotFound(propertyPath: String) extends MutateException {
  override def toString = "Ast Mapping not found for property path "+propertyPath
}