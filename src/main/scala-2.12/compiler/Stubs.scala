package compiler

case class NodeStub(int: Int) {
  val name = "a"+int
  def nextName = NodeStub(int+1)
}

case class CollectableStub(int: Int) {
  val name = "c"+int
}