package com.useoptic.common

package object spec_types {

  trait ApiSpecificationComponent {
    def issues: Vector[ApiIssue]
    def hasIssues: Boolean = issues.nonEmpty

    def identifier: String
  }

  trait SpecIssue {
      val title: String
      val message: String
      val doctag: String
      val identifier: String
  }

}