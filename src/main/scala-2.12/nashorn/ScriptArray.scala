package nashorn

import java.util
import jdk.nashorn.api.scripting.{JSObject, ScriptObjectMirror}
import scala.collection.JavaConverters._

private object ScriptArray {

  ScriptObjectUtils.engine.put("ScriptArray", this)

  def from[A](vector: Vector[A]) = new ScriptArray(vector)
  def mapUp[A >: Null](scriptArray: ScriptArray[A], scriptObjectMirror: ScriptObjectMirror) = {
    new ScriptArray(scriptArray.vector.map( i=> scriptObjectMirror.call(null, i.asInstanceOf[AnyRef]) ))
  }

  def groupByUp[A >: Null](scriptArray: ScriptArray[A], scriptObjectMirror: ScriptObjectMirror) = {

    scriptArray.vector.groupBy(i=> {
      scriptObjectMirror.call(null, i.asInstanceOf[AnyRef])
    }).map(i=> {
      (i._1 -> new ScriptArray(i._2))
    }).toMap

  }

  val find = ScriptObjectUtils.engine
    .eval("function (predicate) { " +
      "return this.array.find(" +
      "function (i) { return predicate(i) } )" +
      ".getOrElse(function () { return null  }) }")

  val filter = ScriptObjectUtils.engine
    .eval("function (predicate) { return ScriptArray.from( this.array.filter(function (i) { return predicate(i) } ) ) }")

  val map = ScriptObjectUtils.engine
    .eval("function (block) { return ScriptArray.mapUp(this, block) }")

  val groupBy = ScriptObjectUtils.engine
    .eval("function (block) { return ScriptArray.groupByUp(this, block) }")


  null

}

class ScriptArray[A >: Null](val vector: Vector[A]) extends JSObject {

  override def equals(that: Any): Boolean = {
    if (that.isInstanceOf[ScriptArray[A]]) {
      vector == that.asInstanceOf[ScriptArray[A]].vector
    } else false
  }

  override def eval(s: String): AnyRef = this

  override def hasSlot(i: Int): Boolean = vector.size <= i

  override def call(o: scala.Any, objects: AnyRef*): AnyRef = {
    println(o)
    println(objects)
    this
  }

  override def setMember(s: String, o: scala.Any): Unit = {
    this
  }

  override def isInstanceOf(o: scala.Any): Boolean = {
    o.getClass == this.getClass
  }

  override def newObject(objects: AnyRef*): AnyRef = null

  override def isFunction: Boolean = false

  override def values(): util.Collection[AnyRef] = vector.asJavaCollection.asInstanceOf[util.Collection[AnyRef]]

  override def getSlot(i: Int): AnyRef = {
    if (hasSlot(i)) {
      vector(i).asInstanceOf[AnyRef]
    } else throw new Error("index "+i+" is beyond range "+vector.size)
  }

  override def hasMember(s: String): Boolean = false

  override def isInstance(o: scala.Any): Boolean = true

  override def getClassName: String = "ScriptObjectArray"

  override def getMember(key: String): AnyRef = {
    key match {
      case "length" => Int.box(vector.length)
      case "find" => ScriptArray.find
      case "filter" => ScriptArray.filter
      case "map" => ScriptArray.map
      case "groupBy" => ScriptArray.groupBy

      case "array" => vector
    }
  }

  override def isArray: Boolean = true

  override def setSlot(i: Int, o: scala.Any): Unit = null

  override def removeMember(s: String): Unit = null

  override def isStrictFunction: Boolean = false

  override def toNumber: Double = hashCode()

  override def keySet(): util.Set[String] = (0 to vector.length-1).map(_.toString).toSet.asJava
}
