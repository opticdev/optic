package compiler

trait ParserGeneratorNode {
  private var children : Vector[ParserGeneratorNode] = Vector()
  def addChild(child: ParserGeneratorNode) = children = children :+ child
  def getChildren = children
  def jsCode : String
}
