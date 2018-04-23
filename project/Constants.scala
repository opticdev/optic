import sbt.File

import scala.io.Source
import scala.util.Try

object Constants {
  val opticMDVersion = "0.1.10"
  val opticMDTar = s"https://registry.npmjs.org/optic-markdown/-/optic-markdown-${opticMDVersion}.tgz"
  val opticMDTarSum = "b8dd84a9818a24ccd8017b696824050db141eb1c"

  val mixpanelToken: String = Try { Source.fromFile(new File("project/mixpanel-token")).getLines().toVector.head }.getOrElse(null)
}
