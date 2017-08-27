package sourcegear

import java.nio.ByteBuffer

import sourcegear.gears.{NodeDesc, ParseGear}
import cognitro.parsers.GraphUtils.Path.FlatWalkablePath
import sdk.descriptions.{Component, Rule}

object GearSerialization {

  case class ParserGearData(description: NodeDesc,
                            components: Map[FlatWalkablePath, Vector[Component]],
                            rules: Map[FlatWalkablePath, Vector[Rule]])

  implicit class ParserGearSerialization(val parser: ParseGear) {
//    def serialize: ByteBuffer = Pickle.intoBytes(ParserGearData(parser.description, parser.components, parser.rules))
  }

}


//@todo Generics are not supported. Implement this with nice traits when boopickle gets act together
//trait SourceGearSerializable[T] {
//  val gear : T
//  def serialize: ByteBuffer = Pickle.intoBytes(gear)
//}
//
//trait SourceGearDeserializable[T] {
//  def fromData(buf: ByteBuffer) = Unpickle[T].fromBytes(buf)
//}