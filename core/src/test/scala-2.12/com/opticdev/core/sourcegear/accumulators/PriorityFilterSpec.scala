package com.opticdev.core.sourcegear.accumulators

import com.opticdev.core.sourcegear.accumulate.{PriorityFilter, PriorityFilterSubject}
import org.scalatest.FunSpec

class PriorityFilterSpec extends FunSpec {

  it("will yield to higher priority when ranges are equal") {
    val testA = Seq(
      PriorityFilterSubject(Range(1,5), 1, "ABC"),
      PriorityFilterSubject(Range(1,5), 2, "DEF")
    )

    val results = PriorityFilter.filter[String](testA:_*)

    assert(results == Seq("DEF"))
  }

  it("will yield to highest priority (of 4 options) when ranges are equal") {
    val testA = Seq(
      PriorityFilterSubject(Range(1,5), 1, "ABC"),
      PriorityFilterSubject(Range(1,5), 2, "DEF"),
      PriorityFilterSubject(Range(1,5), 3, "GHI"),
      PriorityFilterSubject(Range(1,5), 4, "JKL")
    )

    val results = PriorityFilter.filter[String](testA:_*)

    assert(results == Seq("JKL"))
  }

  it("will yield two highest priorities (of 4 options) 2 priority 2 and 2 priority 4") {
    val testA = Seq(
      PriorityFilterSubject(Range(1,5), 2, "ABC"),
      PriorityFilterSubject(Range(1,5), 2, "DEF"),
      PriorityFilterSubject(Range(1,5), 4, "GHI"),
      PriorityFilterSubject(Range(1,5), 4, "JKL")
    )

    val results = PriorityFilter.filter[String](testA:_*)

    assert(results == Seq("GHI", "JKL"))
  }

  it("Yields to largest range if same priority") {
    val testA = Seq(
      PriorityFilterSubject(Range(1,5), 2, "ABC"),
      PriorityFilterSubject(Range(1,9), 2, "DEFG")
    )

    val results = PriorityFilter.filter[String](testA:_*)

    assert(results == Seq("DEFG"))
  }

  it("Same range, same priority returns all") {
    val testA = Seq(
      PriorityFilterSubject(Range(1,5), 2, "ABC"),
      PriorityFilterSubject(Range(1,5), 2, "DEFG")
    )

    val results = PriorityFilter.filter[String](testA:_*)

    assert(results == Seq("ABC", "DEFG"))
  }


}
