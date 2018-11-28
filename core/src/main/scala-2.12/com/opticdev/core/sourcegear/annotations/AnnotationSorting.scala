package com.opticdev.core.sourcegear.annotations

import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}

object AnnotationSorting {
  trait SortableAnnotation {
    def isBlock: Boolean
    final def isInline: Boolean = !isBlock
  }
/*
  Rules:
  1. Each annotation can be linked to 1 and only 1 model
  2. Which model is decided based on the intersection of lines. Models can across many lines, annotations can only be on one
  3. Once all the intersections are collected:
      3a. If inline annotation, priority is given to the model that has the smallest range (most local...)
      3b. If block annotation, priority is given to the model that starts nearest to the block
  4. It is ok for some annotations not to be used
 */

  def sortAnnotations[M, A <: SortableAnnotation](modelLineRanges: Vector[(Range, M, Range)], //Line Ranges, ModelNode, Char ranges
                                                  annotations: Seq[(Int, A)]) : Map[M, Vector[A]] = {

    val sortedModelLineRanges = modelLineRanges.sortBy(_._1.start)
//
//    println(sortedModelLineRanges.map(i => s"""${i._1.start}, ${i._1.end}   ${i._2}""").mkString("\n"))
//    println("  ")
//    println(annotations.mkString("\n"))

    annotations.map{ case (line, annotation) =>
        val possibleLines = sortedModelLineRanges.filter(_._1.inclusive.contains(line))
        if (annotation.isBlock) {
          //find the one that starts earliest, but on/after the annotations line
          possibleLines.filter(_._1.start >= line).sortBy(_._3.start).headOption.map(i=> (i._2, annotation))
        } else {
          possibleLines.sortBy(_._1.size).headOption.map(i=> (i._2, annotation))
        }
    }.collect{case a if a.isDefined => a.get}
     .groupBy(_._1)
     .mapValues(aSeq => aSeq
       .toVector
       .map(_._2)
       .sortBy(a=> annotations.find(_._2 == a).map(_._1)
         .getOrElse(0)))
  }

}
