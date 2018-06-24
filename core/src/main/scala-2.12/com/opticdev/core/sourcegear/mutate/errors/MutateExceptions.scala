package com.opticdev.core.sourcegear.mutate.errors

trait MutateException extends Exception


case class ComponentNotFound(propertyPath: Seq[String]) extends MutateException {
  override def toString = "Component not found for property path "+propertyPath
}

case class AstMappingNotFound(propertyPath: Seq[String]) extends MutateException {
  override def toString = "Ast Mapping not found for property path "+propertyPath
}