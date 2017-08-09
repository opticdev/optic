package TestClasses

import cognitro.parsers.GraphUtils.NodeType
import nashorn.scriptobjects.accumulators.Accumulator
import providers.AccumulatorProvider

object TestAccumulatorManager extends AccumulatorProvider {

  private var accumulators : Vector[Accumulator] = Vector()

  def clear = {
    accumulators = Vector()
  }

  def addAccumulator(accumulator: Accumulator): Unit = {
    accumulators :+= accumulator
  }

  def addAccumulators(is: Accumulator*) : Unit = {
    accumulators ++= is.toVector
  }

  def removeAccumulator(accumulator: Accumulator): Unit = {
    accumulators = accumulators.filterNot(_ == accumulator)
  }

  override def allAccumulators: Vector[Accumulator] = accumulators
}


