package com.opticdev.core.sourcegear.gears.helpers

import com.opticdev.core.sourcegear.containers.SubContainerMatch
import com.opticdev.core.sourcegear.gears.parsing.MatchResults

object ChildrenVectorComparison {

  /*
  Because of the JVM there's very little abstraction here (although there could be).
  More verbose seems to run faster and since there are in the largest loop it makes sense.
   */

  def any[A, B](source: Vector[A], description: Vector[B], equality: (A, B) => MatchResults ): MatchResults =
    MatchResults(true, None)

  def exact[A, B](source: Vector[A], description: Vector[B], equality: (A, B) => MatchResults ): MatchResults = {

    //if number of children is different, fail
    if (source.size != description.size) return MatchResults(false, None)

    val childResults = source.zip(description).map(i=> equality(i._1, i._2))
    if (childResults.forall(_.isMatch)) {
      MatchResults(true, collectExtracted(childResults), containers = collectContainers(childResults))
    } else {
      MatchResults(false, None)
    }
  }

  def samePlus[A, B](source: Vector[A], description: Vector[B], equality: (A, B) => MatchResults ): MatchResults = {

    //if there are less in source than description, fail it.
    if (source.size < description.size) return MatchResults(false, None)

    val sourceIterator = source.toIterator
    val descriptionIterator = description.toIterator

    //if there is no description then its a same plus. case closed
    if (!descriptionIterator.hasNext) return MatchResults(true, None)

    var currentDescriptionChild = descriptionIterator.next

    var foundAll = false

    val extractions = collection.mutable.ListBuffer[MatchResults]()

    while (sourceIterator.hasNext && !foundAll) {
      val currentSource = sourceIterator.next
      val equalityCheck = equality(currentSource, currentDescriptionChild)
      if (equalityCheck.isMatch) {
        extractions += equalityCheck
        if (descriptionIterator.hasNext) {
          currentDescriptionChild = descriptionIterator.next
        } else {
          foundAll = true
        }
      }
    }

    MatchResults(foundAll,
      {if (foundAll) collectExtracted(extractions.toVector) else None},
      containers = {if (foundAll) collectContainers(extractions.toVector) else None})
  }

  def sameAnyOrder[A, B](source: Vector[A], description: Vector[B], equality: (A, B) => MatchResults ): MatchResults = {

    //if number of children is different, fail
    if (source.size != description.size) return MatchResults(false, None)

    val sourceAsMutable = collection.mutable.ListBuffer(source:_*)

    val extractions = collection.mutable.ListBuffer[MatchResults]()

    val isMatch = description.forall(i=> {
      val inSourceOption = sourceAsMutable.find(s=> {
        val equalityResult = equality(s, i)
        if (equalityResult.isMatch) {
          extractions += equalityResult
        }
        equalityResult.isMatch
      })
      if (inSourceOption.isDefined) {
        val inSource = inSourceOption.get
        sourceAsMutable -= inSource
        true
      } else {
        false
      }
    })

    MatchResults(isMatch,
      if (isMatch) collectExtracted(extractions.toVector) else None,
      containers = {if (isMatch) collectContainers(extractions.toVector) else None})

  }

  def sameAnyOrderPlus[A,B](source: Vector[A], description: Vector[B], equality: (A, B) => MatchResults ): MatchResults = {

    //if there are less in source than description, fail it.
    if (source.size < description.size) return MatchResults(false, None)

    val sourceAsMutable = collection.mutable.ListBuffer(source:_*)

    val extractions = collection.mutable.ListBuffer[MatchResults]()

    val isMatch = description.forall(i=> {
      val inSourceOption = sourceAsMutable.find(s=> {
        val equalityResult = equality(s, i)
        if (equalityResult.isMatch) {
          extractions += equalityResult
        }
        equalityResult.isMatch
      })

      if (inSourceOption.isDefined) {
        val inSource = inSourceOption.get
        sourceAsMutable -= inSource
        true
      } else {
        false
      }
    })

    MatchResults(isMatch, if (isMatch) collectExtracted(extractions.toVector) else None,
      containers = {if (isMatch) collectContainers(extractions.toVector) else None})

  }



  //shared
  private def collectExtracted(matchResults: Vector[MatchResults]) : Option[Set[ModelField]] = {
    val results = matchResults.filter(_.extracted.isDefined)
      .flatMap(_.extracted.get).toSet

    if (results.nonEmpty) Option(results) else None
  }

  private def collectContainers(matchResults: Vector[MatchResults]) : Option[Set[SubContainerMatch]] = {
    val results = matchResults.filter(_.containers.isDefined)
      .flatMap(_.containers.get).toSet

    if (results.nonEmpty) Option(results) else None
  }
}
