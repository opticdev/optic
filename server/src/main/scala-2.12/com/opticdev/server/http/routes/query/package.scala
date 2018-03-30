package com.opticdev.server.http.routes

import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import com.opticdev.parsers.graph.CommonAstNode

package object query {
  trait QueryComponent {
    def evaluate(linkedModelNode: LinkedModelNode[CommonAstNode]) : Boolean
  }
}
