package com.opticdev.opm.utils

import com.opticdev.opm.{BatchPackageResult, BatchParserResult}


object FlattenBatchResultsImplicits {

  implicit class FlattenBatchPackageResults(seq: Seq[BatchPackageResult]) {

    def flattenResults : BatchPackageResult = {

      val found = seq.map(i=> i.found)
      val notFound = seq.map(i=> i.notFound)

      val foundFlattened = found.flattenSequenceWith(i=> i.packageId)
      val notFoundFlattened = notFound.flattenSequenceWith(i=> i)

      //clear out any not founds taken care of by another provider
      val notFoundFlattenedFiltered = notFoundFlattened
        .filterNot(n=> foundFlattened.exists(_.packageRef == n))


      BatchPackageResult(foundFlattened, notFoundFlattenedFiltered)
    }

  }

  implicit class FlattenBatchParserResults(seq: Seq[BatchParserResult]) {

    def flattenResults : BatchParserResult = {

      val found = seq.map(i=> i.found)
      val notFound = seq.map(i=> i.notFound)

      val foundFlattened = found.flattenSequenceWith(i=> i.parserRef)
      val notFoundFlattened = notFound.flattenSequenceWith(i=> i)

      //clear out any not founds taken care of by another provider
      val notFoundFlattenedFiltered = notFoundFlattened
        .filterNot(n=> foundFlattened.exists(_.parserRef == n))

      BatchParserResult(foundFlattened, notFoundFlattenedFiltered)

    }

  }

  implicit class CascadingFlatten[A, T](seq: Seq[Set[A]]) {
    def flattenSequenceWith(func: (A) => T) : Set[A] = {
      val converted = seq.map(_.map(func))

      val finalMap = seq.foldLeft(collection.mutable.Map[T, A]()) {
        case (map, set) => {
          set.foreach(item=> {
            val key : T = func(item)

            if (!map.contains(key)) {
              map(key) = item
            }
          })
          map
        }
      }

      finalMap.values.toSet

    }
  }

}



