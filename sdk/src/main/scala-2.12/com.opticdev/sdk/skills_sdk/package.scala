package com.opticdev.sdk

import com.opticdev.parsers.rules.ChildrenRuleTypeEnum
import play.api.libs.json.{Format, JsString}

package object skills_sdk {
  type OMChildrenRuleType = ChildrenRuleTypeEnum


  sealed trait AssignmentOperations
  case object SetValue extends AssignmentOperations
  case class AppendItems(unique: Boolean = false) extends AssignmentOperations
  case class PrependItems(unique: Boolean = false) extends AssignmentOperations

}
