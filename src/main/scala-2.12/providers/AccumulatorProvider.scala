package providers

import cognitro.parsers.GraphUtils.NodeType
import nashorn.scriptobjects.accumulators.Accumulator
import nashorn.scriptobjects.insights.Insight


trait AccumulatorProvider {

  def clear : Unit

  def addAccumulator(insight: Accumulator): Unit

  def addAccumulators(is: Accumulator*) : Unit

  def removeAccumulator(insight: Accumulator): Unit

  def allAccumulators : Vector[Accumulator]

}