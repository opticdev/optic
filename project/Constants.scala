import sbt.File

import scala.io.Source
import scala.util.Try

object Constants {
  val opticMDVersion = "1.0.0-rc2"
  val opticMDTar = s"https://registry.npmjs.org/optic-markdown/-/optic-markdown-${opticMDVersion}.tgz"
  val opticMDTarSum = "0e373e0d1e54f09044a1d431e187e6c12e6f0e75"

  val mixpanelToken: String = Try { Source.fromFile(new File("project/mixpanel-token")).getLines().toVector.head }.getOrElse(null)
}
