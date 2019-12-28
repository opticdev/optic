package com.seamless.changelog

import com.seamless.contexts.shapes.ShapeEntity
import com.seamless.diff.ShapeLikeJs


// Just an illustration of how this might work...results are not to be trusted
// One could imagine making this plug-able and even querying runtime analytics ie Breaking change for ios,web consumers, but not android consumer

trait BreakingChangeRuleSet {
  def addField(context: ChangelogContext): ChangeTag
  def removeField(context: ChangelogContext): ChangeTag
  def changeShape(expected: ShapeEntity, actual: ShapeLikeJs, context: ChangelogContext): ChangeTag
}

object BasicBreakingChangeRules extends BreakingChangeRuleSet {

  def changeShape(expected: ShapeEntity, actual: ShapeLikeJs, context: ChangelogContext): ChangeTag = UnknownChange

  def addField(context: ChangelogContext): ChangeTag = {
    context match {
      case InRequest(requestId) => Breaking("New Required Field in Request")
      case InResponse(responseId, statusCode) => Compatible
    }
  }

  def removeField(context: ChangelogContext): ChangeTag = {
    context match {
      case InRequest(requestId) => Compatible
      case InResponse(responseId, statusCode) => Breaking("New Required Field in Request")
    }
  }
}
