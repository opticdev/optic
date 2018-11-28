package com.opticdev.common

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

package object graph {

  type AstGraph = Graph[BaseNode, LkDiEdge]

  sealed trait NodeType {
    val name : String
  }

  case class AstType(override val name: String, implicit val language: String) extends NodeType {
    def asString = name+":"+language
    def apply(name: String)(implicit language: String) = {
      AstType(name, language)
    }
  }


  case class ModelType(override val name: String) extends NodeType

  trait CustomEdge {
    val isChild = false
    val isProduces = false
  }

  case class Child(index : Int, typ: String, fromArray: Boolean = false) extends CustomEdge {
    override val isChild = true
    override def equals(other: Any) = other match {
      case that: Child => (that.index == this.index) && that.typ == this.typ
      case _           => false
    }
    override def hashCode = (index.toString + typ).##
  }

  case class Produces(label: String = null) extends CustomEdge {
    override val isProduces = true
  }

}
