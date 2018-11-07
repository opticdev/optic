package com.opticdev.sdk.rules

sealed trait ChildrenRuleTypeEnum

case object Any extends ChildrenRuleTypeEnum
case object Exact extends ChildrenRuleTypeEnum
case object SameAnyOrder extends ChildrenRuleTypeEnum
case object SamePlus extends ChildrenRuleTypeEnum
case object SameAnyOrderPlus extends ChildrenRuleTypeEnum