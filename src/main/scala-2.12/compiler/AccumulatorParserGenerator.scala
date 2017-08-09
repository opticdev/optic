package compiler

import cognitro.parsers.GraphUtils.ModelType
import nashorn.scriptobjects.Groupable
import compiler.JsUtils._

import scala.collection.immutable.Iterable

class AccumulatorParserGenerator(accumulatorCollect: Map[ModelType, Set[Groupable]]) {

  private object CollectableStubGenerator {
    private var currentInt : Int = 0
    def nextName : CollectableStub = {
      val next = CollectableStub(currentInt)
      currentInt += 1
      next
    }
  }

  private val mapping: Iterable[(ModelType, Set[Groupable], CollectableStub)] = accumulatorCollect.map(item=> {
    (item._1, item._2, CollectableStubGenerator.nextName)
  })

  private val keys = mapping.map(_._3.name).toSeq

  private val collectable = CollectableDeclaration(mapping)

  private val parserMain = AccumulatorParserMain()

  //break the found nodes into searchable groups. By default, these groups are defined by the file
  parserMain.addChild(EstablishLocalGroups(keys))

  //iterate each local group and do matches until models are found and/or every node is exhausted.

  //return models, move along.


  def generate = ""

}

case class AccumulatorParserMain() extends ParserGeneratorNode {
  override def jsCode: String = "function (nodes) { \n"+
    getChildren.map(_.jsCode).mkString("\n") +
    "\n}"
}

case class CollectableDeclaration(mapping: Iterable[(ModelType, Set[Groupable], CollectableStub)]) extends ParserGeneratorNode {
  override def jsCode: String = "{\n" +
    mapping.map(i=> i._3.name+" :"+doubleQuotes(i._1.name)).mkString(",\n") +
    "\n}"
}

case class EstablishLocalGroups(keys: Seq[String]) extends ParserGeneratorNode {
  override def jsCode: String = {
    ""
  }
}
