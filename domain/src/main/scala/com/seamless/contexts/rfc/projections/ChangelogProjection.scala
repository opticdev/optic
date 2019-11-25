package com.seamless.contexts.rfc.projections

import com.seamless.changelog.{CalculateChangelog, Changelog}
import com.seamless.contexts.rfc.Events.{GitStateSet, RfcEvent}
import com.seamless.contexts.rfc.RfcState
import io.circe._
import io.circe.generic.auto._
import com.seamless.contexts.rfc.ScmState.{BranchName, CommitId}
import io.circe.syntax._

object ChangelogProjection {

  case class ChangelogWithSCM(branch: BranchName, changesSinceCommit: CommitId, changelog: Changelog)

  def branchChangelog(branch: BranchName, commitId: Option[CommitId], events: Vector[RfcEvent], rfcState: RfcState): Option[ChangelogWithSCM] = {

    if (commitId.isEmpty) {
      implicit val input = CalculateChangelog.prepare(events, 0)
      Some(ChangelogWithSCM(branch, "initial", CalculateChangelog.generate(input)))
    } else {
      val commitsDescending = rfcState.scmState.branchCommitMap.getOrElse(branch, Vector.empty).reverse
      commitsDescending.find(i => commitId.contains(i.commitId)).map { lastCommit =>

        val bookmark = events.zipWithIndex.collectFirst {
          case (gitState: GitStateSet, index) if lastCommit.commitId == gitState.commitId && gitState.branchName == branch => index
        }.getOrElse(0)

        implicit val input = CalculateChangelog.prepare(events, bookmark)

        ChangelogWithSCM(branch, lastCommit.commitId, CalculateChangelog.generate(input))

      }
    }
  }

}
