import sbt.File

import scala.io.Source
import scala.util.Try

object Constants {
  val opticMDVersion = "0.1.8-alpha.3"
  val opticMDTar = s"https://registry.npmjs.org/optic-markdown/-/optic-markdown-${opticMDVersion}.tgz"
  val opticMDTarSum = "7bb375efc1ed254b98836bd5fa83a8f2e4514415"


  val mixpanelToken: String = Try { Source.fromFile(new File("project/mixpanel-token")).getLines().toVector.head }.getOrElse(null)

}
