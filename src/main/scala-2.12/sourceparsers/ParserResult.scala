package sourceparsers


sealed trait ParserResult

case class Success(name: String) extends ParserResult
case class Failure(reason: String) extends ParserResult