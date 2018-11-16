package com.opticdev.core.sourcegear.annotations

import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}

object AnnotationSorting {
/*
  Rules:
  1. Each annotation can be linked to 1 and only 1 model
  2. Which model is decided based on the intersection of lines. Models can across many lines, annotations can only be on one
  3. Once all the intersections are collected, priority is given to the model that has the smallest range (most local...)
  4. It is ok for some annotations not to be used
 */
  def sortAnnotations[M, A](modelLineRanges: Vector[(Range, M)], annotations: Seq[(Int, A)]): Map[M, Vector[A]] = {
    annotations.map{ case (line, annotation) =>
        val possibleLines = modelLineRanges.filter(_._1.inclusive.contains(line))

        possibleLines.sortBy(_._1.size).headOption.map(i=> (i._2, annotation))
    }.collect{case a if a.isDefined => a.get}
     .groupBy(_._1)
     .mapValues(aSeq => aSeq
       .toVector
       .map(_._2)
       .sortBy(a=> annotations.find(_._2 == a).map(_._1)
         .getOrElse(0)))
  }

}
