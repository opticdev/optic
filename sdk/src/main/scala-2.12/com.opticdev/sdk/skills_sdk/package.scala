package com.opticdev.sdk

import com.opticdev.sdk.rules.ChildrenRuleTypeEnum
import play.api.libs.json.{Format, JsString}

package object skills_sdk {
  type OMChildrenRuleType = ChildrenRuleTypeEnum


  sealed trait AssignmentOperations
  case object SetValue extends AssignmentOperations
  case object AppendItems extends AssignmentOperations
  case object AppendItemsUnique extends AssignmentOperations
  case object PrependItems extends AssignmentOperations
  case object PrependItemsUnique extends AssignmentOperations

}
