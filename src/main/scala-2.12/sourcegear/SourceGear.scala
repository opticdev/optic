package sourcegear

import cognitro.parsers.ParserBase

abstract class SourceGear {
  val parser: ParserBase
  val gearset: Gearset = new Gearset
}
