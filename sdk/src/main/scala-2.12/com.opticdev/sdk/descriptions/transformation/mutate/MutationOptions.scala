package com.opticdev.sdk.descriptions.transformation.mutate

import com.opticdev.sdk.VariableMapping

case class MutationOptions(tags: Option[TagMutations] = None,
                           containers: Option[ContainerMutations] = None,
                           variables: Option[VariableMapping] = None)