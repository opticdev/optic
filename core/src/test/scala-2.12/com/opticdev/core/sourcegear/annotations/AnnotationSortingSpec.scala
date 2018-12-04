package com.opticdev.core.sourcegear.annotations
import com.opticdev.core.sourcegear.annotations.AnnotationSorting.SortableAnnotation
import com.opticdev.core.sourcegear.annotations._
import org.scalatest.FunSpec

case class TestAnnotation(string: String, isBlock: Boolean = false) extends SortableAnnotation

class AnnotationSortingSpec extends FunSpec {
  val models = Vector(
    (Range(1,5), "Dog", Range(0, 1)),
      (Range(1,2), "Nose", Range(10, 11)),
      (Range(4,4), "Tail", Range(20, 11)),

    (Range(7,12), "Cat", Range(30, 31)),
      (Range(11,12), "Claws", Range(40, 41)),

    (Range(18,24), "Pig", Range(50, 51)),
  )

  val annotations = Vector(
    (1, TestAnnotation("Cute")),
    (3,TestAnnotation("My")),
    (4,TestAnnotation("Wagging")),

    (11,TestAnnotation("Sharp")),
    (11,TestAnnotation("Dangerous")),
    (12,TestAnnotation("Scary")),

    (25,TestAnnotation("orphan")),
  )

  it("can sort properly") {
    val results = AnnotationSorting.sortAnnotations[String, TestAnnotation](models, annotations)
    assert(results ==
    Map(
      "Dog" -> Vector(TestAnnotation("My")),
        "Nose" -> Vector(TestAnnotation("Cute")),
        "Tail" -> Vector(TestAnnotation("Wagging")),

      "Claws" -> Vector(TestAnnotation("Sharp"), TestAnnotation("Dangerous"), TestAnnotation("Scary"))
    ))
  }

  it("can sort properly with blocks") {
    val models = Vector(
      (Range(1,5), "Dog", Range(1, 90)),
      (Range(1,3), "Nose", Range(40, 55)),
    )

    val annotations = Vector(
      (1, TestAnnotation("Cute", isBlock = true)),
      (2,TestAnnotation("My"))
    )

    val results = AnnotationSorting.sortAnnotations[String, TestAnnotation](models, annotations)

    assert(results == Map("Dog" -> Vector(TestAnnotation("Cute",true)), "Nose" -> Vector(TestAnnotation("My",false))))
  }

}
