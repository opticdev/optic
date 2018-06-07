package com.opticdev.sdk.descriptions.transformation

import com.opticdev.sdk.descriptions.transformation.generate.StagedNode
import com.opticdev.sdk.descriptions.transformation.mutate.StagedMutation
import play.api.libs.json._

import scala.util.Try

package object mutate {

  trait MutateResult extends TransformationResult

  type TagMutations = Map[String, StagedTagMutation]
  type ContainerMutations = Map[String, StagedContainerMutation]


  case class StagedContainerMutation(operation: ContainerMutationOperation)

  sealed trait ContainerMutationOperation
  object ContainerMutationOperationsEnum {
    case class Append(items: Seq[StagedNode]) extends ContainerMutationOperation
    case class Prepend(items: Seq[StagedNode]) extends ContainerMutationOperation
    case class ReplaceWith(items: Seq[StagedNode]) extends ContainerMutationOperation
    case class InsertAt(index: Int, items: Seq[StagedNode]) extends ContainerMutationOperation
    case object Empty extends ContainerMutationOperation
  }


}
