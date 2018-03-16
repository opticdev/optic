import sbt.File

import scala.io.Source
import scala.util.Try

object Constants {
  val opticMDVersion = "0.1.2"
  val opticMDTar = s"https://registry.npmjs.org/optic-markdown/-/optic-markdown-${opticMDVersion}.tgz"
  val opticMDTarSum = "764f6cf924fdd8a899e26b8eb982d3a497878656"

  val mixpanelToken: String = Try { Source.fromFile(new File("project/mixpanel-token")).getLines().toVector.head }.getOrElse(null)

}
