package com.opticdev.sdk.descriptions.transformation

import com.opticdev.sdk.descriptions.transformation.generate.StagedNode
import com.opticdev.sdk.descriptions.transformation.mutate.StagedMutation

package object mutate {

  trait MutateResult extends TransformationResult

  type TagMutations = Map[String, StagedTagMutation]
  type ContainerMutations = Map[String, ContainerMutation]

  sealed trait ContainerMutation
  case class Append(items: Seq[StagedNode]) extends ContainerMutation
  case class Prepend(items: Seq[StagedNode]) extends ContainerMutation
  case class ReplaceWith(items: Seq[StagedNode]) extends ContainerMutation
  case class InsertAt(index: Int, items: Seq[StagedNode]) extends ContainerMutation
  case object Empty extends ContainerMutation


}
