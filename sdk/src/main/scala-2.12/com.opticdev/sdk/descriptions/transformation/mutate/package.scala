package com.opticdev.sdk.descriptions.transformation

import com.opticdev.sdk.descriptions.transformation.generate.StagedNode
import com.opticdev.sdk.descriptions.transformation.mutate.StagedMutation

package object mutate {

  trait MutateResult extends TransformationResult

  type TagMutations = Map[String, StagedMutation]
  type ContainerMutations = Map[String, ContainerMutation]

  sealed trait ContainerMutation
  case class Append(items: Seq[StagedNode])
  case class Prepend(items: Seq[StagedNode])
  case class InsertAt(index: Int, items: Seq[StagedNode])
  case object Empty


}
