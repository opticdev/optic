package sourcegear.serialization

import java.nio.ByteBuffer

import better.files.File
import sourcegear.gears.parsing.ParseGear
import boopickle.Default._
import sourcegear.gears.RuleProvider

import scala.util.Try
import sourcegear.serialization.PickleImplicits._

object GearLoader {

  //@todo this has to come from elsewhere...
  implicit val rulesProvider = new RuleProvider()

  def parseGearFromFile(file: File) : Try[ParseGear] =
    Try(Unpickle[ParseGear].fromBytes(ByteBuffer.wrap(file.byteArray)))
}
