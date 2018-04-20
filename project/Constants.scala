import sbt.File

import scala.io.Source
import scala.util.Try

object Constants {
  val opticMDVersion = "0.1.9-alpha.1"
  val opticMDTar = s"https://registry.npmjs.org/optic-markdown/-/optic-markdown-${opticMDVersion}.tgz"
  val opticMDTarSum = "50de81d54beba3f533bd946c56a2bf32d05d6856"

  val mixpanelToken: String = Try { Source.fromFile(new File("project/mixpanel-token")).getLines().toVector.head }.getOrElse(null)

}
