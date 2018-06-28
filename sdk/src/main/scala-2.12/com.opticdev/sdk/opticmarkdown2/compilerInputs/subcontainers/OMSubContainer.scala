package com.opticdev.sdk.opticmarkdown2.compilerInputs.subcontainers

import com.opticdev.sdk.opticmarkdown2.OMChildrenRuleType
import com.opticdev.sdk.opticmarkdown2.lens.{OMComponentWithPropertyPath, OMLensSchemaComponent}

case class OMSubContainer(name: String,
                          childrenRule: OMChildrenRuleType,
                          schemaComponents: Vector[OMComponentWithPropertyPath[OMLensSchemaComponent]]) extends OMContainerBase
