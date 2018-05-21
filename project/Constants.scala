import sbt.File

import scala.io.Source
import scala.util.Try

object Constants {
  val opticMDVersion = "1.0.0-rc2"
  val mixpanelToken: String = Try { Source.fromFile(new File("project/mixpanel-token")).getLines().toVector.head }.getOrElse(null)
}
