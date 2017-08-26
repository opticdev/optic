package sourcegear.gears.helpers

import sourcegear.gears.MatchResults

object ChildrenVectorComparison {

  /*
  Because of the JVM there's very little abstraction here (although there could be).
  More verbose seems to run faster and since there are in the largest loop it makes sense.
   */

  def samePlus[A, B](source: Vector[A], description: Vector[B], equality: (A, B) => MatchResults ): MatchResults = {

    //if there are less in source than description, fail it.
    if (source.size < description.size) return MatchResults(false, None)

    val sourceIterator = source.toIterator
    val descriptionIterator = description.toIterator

    //if there is no description then its a same plus. case closed
    if (!descriptionIterator.hasNext) return MatchResults(true, None) else descriptionIterator.next()

    var currentDescriptionChild = descriptionIterator.next

    var foundAll = false

    while (sourceIterator.hasNext && !foundAll) {
      val currentSource = sourceIterator.next
      val equalityCheck = equality(currentSource, currentDescriptionChild)
      if (equalityCheck.isMatch) {
        if (descriptionIterator.hasNext) {
          currentDescriptionChild = descriptionIterator.next
        } else {
          foundAll = true
        }
      }
    }

    MatchResults(foundAll, None)
  }

  def sameAnyOrder[A, B](source: Vector[A], description: Vector[B], equality: (A, B) => MatchResults ): MatchResults = {

    //if number of children is different, fail
    if (source.size != description.size) return MatchResults(false, None)

    val sourceAsMutable = collection.mutable.ListBuffer(source:_*)

    val isMatch = description.forall(i=> {
      val inSourceOption = sourceAsMutable.find(s=> equality(s, i).isMatch)
      if (inSourceOption.isDefined) {
        val inSource = inSourceOption.get
        sourceAsMutable -= inSource
        true
      } else {
        false
      }
    })

    MatchResults(isMatch, None)

  }

  def sameAnyOrderPlus[A,B](source: Vector[A], description: Vector[B], equality: (A, B) => MatchResults ): MatchResults = {

    //if there are less in source than description, fail it.
    if (source.size < description.size) return MatchResults(false, None)

    val sourceAsMutable = collection.mutable.ListBuffer(source:_*)

    val isMatch = description.forall(i=> {
      val inSourceOption = sourceAsMutable.find(s=> equality(s, i).isMatch)
      if (inSourceOption.isDefined) {
        val inSource = inSourceOption.get
        sourceAsMutable -= inSource
        true
      } else {
        false
      }
    })

    MatchResults(isMatch, None)

  }

}
