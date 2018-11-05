package com.opticdev.sdk.skills_sdk.compilerInputs

import com.opticdev.parsers.rules.ChildrenRuleTypeEnum
import com.opticdev.sdk.skills_sdk.OMChildrenRuleType
import com.opticdev.sdk.skills_sdk.lens.{OMComponentWithPropertyPath, OMLensSchemaComponent}

package object subcontainers {
  trait OMContainerBase {
    val childrenRule : OMChildrenRuleType
    val schemaComponents: Vector[OMComponentWithPropertyPath[OMLensSchemaComponent]]
  }
}
