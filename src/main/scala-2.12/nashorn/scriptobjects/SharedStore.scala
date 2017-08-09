package nashorn.scriptobjects

class SharedStore {

  private var store : Map[String, Any] = Map()

  def value(key: String, value: Any) : Boolean = {
    val existingValueOption = store.get(key)

    if (existingValueOption.isDefined) {
      existingValueOption.get == value
    } else {
      store = store + (key -> value)
      return true
    }

  }

}

object SharedStore {
  def empty : SharedStore = new SharedStore
}
