package com.opticdev.core.sourcegear.annotations

import org.scalatest.FunSpec

class AnnotationSortingSpec extends FunSpec {
  val models = Vector(
    (Range(1,5), "Dog"),
      (Range(1,2), "Nose"),
      (Range(4,4), "Tail"),

    (Range(7,12), "Cat"),
      (Range(11,12), "Claws"),

    (Range(18,24), "Pig"),
  )

  val annotations = Vector(
    (1, "Cute"),
    (3, "My"),
    (4, "Wagging"),

    (11, "Sharp"),
    (11, "Dangerous"),
    (12, "Scary"),

    (25, "orphan"),
  )

  it("can sort properly") {
    val results = AnnotationSorting.sortAnnotations[String, String](models, annotations)
    assert(results ==
    Map(
      "Dog" -> Vector("My"),
        "Nose" -> Vector("Cute"),
        "Tail" -> Vector("Wagging"),

      "Claws" -> Vector("Sharp", "Dangerous", "Scary")
    ))
  }

}
