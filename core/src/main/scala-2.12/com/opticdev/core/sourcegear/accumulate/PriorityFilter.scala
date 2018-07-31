package com.opticdev.core.sourcegear.accumulate

import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.core.sourcegear.graph.GraphImplicits._
import com.opticdev.parsers.AstGraph

case class PriorityFilterSubject[T](range: Range, priority: Int, item: T)
object PriorityFilter extends {

  def filter[T](subjects: PriorityFilterSubject[T]*) : Vector[T] = {

    def overlapPredicate(v: Seq[PriorityFilterSubject[T]]) : Boolean = {
      val a = v.head
      val b = v.last
      (a.range.inclusive intersect b.range.inclusive).nonEmpty
    }

    val shouldFilterSubjects = subjects.combinations(2).collect {
      case (v) if overlapPredicate(v) => {
        val a = v.head
        val b = v.last

        if (a.priority > b.priority) {
          Seq(b)
        } else if (b.priority > a.priority) {
          Seq(a)
        } else if (a.range.size > b.range.size) {
          Seq(b)
        } else if (b.range.size > a.range.size) {
          Seq(a)
        } else {
          Seq()
        }
      }
    }.flatten.toVector

    subjects.collect {
      case subject if !shouldFilterSubjects.contains(subject) => subject.item
    }.toVector
  }

  def apply(baseModelNodes: BaseModelNode*)(implicit astGraph: AstGraph) : Vector[BaseModelNode] = {
    if (baseModelNodes.forall(_.priority == 1)) {
      baseModelNodes.toVector
    } else {
      val subjects = baseModelNodes.map(i=>
        PriorityFilterSubject(i.astRoot().range, i.priority, i))

      filter[BaseModelNode](subjects:_*)
    }
  }
}
