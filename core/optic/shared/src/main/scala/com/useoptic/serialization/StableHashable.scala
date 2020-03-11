package com.useoptic.serialization

trait StableHashable {
  lazy val toHash: String = {
    import com.roundeights.hasher.Implicits._
    import scala.language.postfixOps
    this.toString.sha1.hex
  }
}
