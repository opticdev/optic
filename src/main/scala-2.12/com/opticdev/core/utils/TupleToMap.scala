package com.opticdev.core.utils

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

object TupleToMap {
  implicit class TupleToMapMethods[A, B](val tupleVector: Vector[(A, B)]) {

      def toMapWithVectorValue : Map[A, Vector[B]] = {
        val keys = tupleVector.map(_._1).toSet //distinct

        keys.map(key=> {
          (key, tupleVector.filter(_._1 == key).map(_._2).toVector)
        }).toMap

      }

    def toMapWithSetValue : Map[A, Set[B]] = {
      val keys = tupleVector.map(_._1).toSet //distinct

      keys.map(key=> {
        (key, tupleVector.filter(_._1 == key).map(_._2).toSet)
      }).toMap

    }

  }

  implicit class CombineMethodsVector[A, B](val mapWithVector: Map[A, Vector[B]]) {

    def concat(map2: Map[A, Vector[B]]) : Map[A, Vector[B]] = {

      val allKeys = mapWithVector.keySet.union(map2.keySet)

      allKeys.map(key=> {

        val newVector = mapWithVector.get(key).getOrElse(Vector()) ++ map2.get(key).getOrElse(Vector())

        (key, newVector)

      }).toMap

    }

  }

  implicit class CombineMethodsSet[A, B](val setWithVector: Map[A, Set[B]]) {

    def concat(set2: Map[A, Set[B]]) :  Map[A, Set[B]] = {

      val allKeys = setWithVector.keySet.union(set2.keySet)

      allKeys.map(key=> {

        val newSet = setWithVector.get(key).getOrElse(Set()) ++ set2.get(key).getOrElse(Set())

        (key, newSet)

      }).toMap

    }

  }

}
