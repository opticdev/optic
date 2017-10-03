package com.opticdev.server.http.routes

import com.opticdev.core.sourcegear.graph.model.LinkedModelNode

package object query {
  trait QueryComponent {
    def evaluate(linkedModelNode: LinkedModelNode) : Boolean
  }
}
