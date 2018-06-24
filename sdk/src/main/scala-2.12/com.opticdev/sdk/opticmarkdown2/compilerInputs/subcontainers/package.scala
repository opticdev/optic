package com.opticdev.sdk.opticmarkdown2.compilerInputs

import com.opticdev.parsers.rules.ChildrenRuleTypeEnum
import com.opticdev.sdk.opticmarkdown2.OMChildrenRuleType
import com.opticdev.sdk.opticmarkdown2.lens.{OMComponentWithPropertyPath, OMLensSchemaComponent}

package object subcontainers {
  trait OMContainerBase {
    val childrenRule : OMChildrenRuleType
    val schemaComponents: Vector[OMComponentWithPropertyPath[OMLensSchemaComponent]]
  }
}
