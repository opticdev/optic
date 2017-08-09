package nashorn.scriptobjects

object Presence extends Enumeration {
  def fromString(string: String) = {
    string match {
      case "required" => REQUIRED
      case "optional" => OPTIONAL
      case "distinct" => DISTINCT
      case everythingElse => throw new Error("Invalid presence enumeration. Valid inputs: ['required', 'optional', 'distinct']")
    }
  }
  val REQUIRED, OPTIONAL, DISTINCT = Value
}

trait Groupable {
  var presence: Presence.Value = Presence.OPTIONAL
  val isLens = false
  val isModel = false
}
