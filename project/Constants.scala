import sbt.File

import scala.io.Source
import scala.util.Try

object Constants {
  val opticMDVersion = "0.1.3"
  val opticMDTar = s"https://registry.npmjs.org/optic-markdown/-/optic-markdown-${opticMDVersion}.tgz"
  val opticMDTarSum = "e3eabdf34733e38923d2b308015e36d6378a5859"

  val mixpanelToken: String = Try { Source.fromFile(new File("project/mixpanel-token")).getLines().toVector.head }.getOrElse(null)

}
