package com.seamless.contexts.rfc

import com.seamless.contexts.rfc.ScmState.{BranchName, CommitId, Version}


case class ScmState(branchCommitMap: Map[BranchName, Vector[Version]]) {
  def record(branchName: BranchName, commitId: CommitId): ScmState = {
    val branchHistory = (branchCommitMap.getOrElse(branchName, Vector.empty) :+ Version(commitId)).distinct
    ScmState(branchCommitMap + (branchName -> branchHistory))
  }
}

object ScmState {
  type BranchName = String
  type CommitId = String
  case class Version(commitId: CommitId)
  def initialState = ScmState(Map.empty)
}
