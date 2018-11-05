package com.opticdev.sdk.skills_sdk.compilerInputs.subcontainers

import com.opticdev.sdk.skills_sdk.OMChildrenRuleType
import com.opticdev.sdk.skills_sdk.lens.{OMComponentWithPropertyPath, OMLensSchemaComponent}

case class OMSubContainer(name: String,
                          childrenRule: OMChildrenRuleType,
                          schemaComponents: Vector[OMComponentWithPropertyPath[OMLensSchemaComponent]]) extends OMContainerBase
