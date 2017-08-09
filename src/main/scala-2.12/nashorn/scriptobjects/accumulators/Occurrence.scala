package nashorn.scriptobjects.accumulators


sealed trait Occurrence {
  def evaluate(matches: Int) : Boolean
}

case class AtLeastOccurrence(int: Int) extends Occurrence {
  override def evaluate(matches: Int) : Boolean = matches >= int
}

case class AtMostOccurrence(int: Int) extends Occurrence {
  override def evaluate(matches: Int) : Boolean = matches <= int
}

case class OccurrenceInt(int: Int) extends Occurrence {
  override def evaluate(matches: Int) : Boolean = matches == int
}
case class NoOccurrence() extends Occurrence {
  override def evaluate(matches: Int) : Boolean = matches == 0
}
case class AnyOccurrence() extends Occurrence {
  override def evaluate(matches: Int) : Boolean = true
}

