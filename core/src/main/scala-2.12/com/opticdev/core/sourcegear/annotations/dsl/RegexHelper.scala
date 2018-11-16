package com.opticdev.core.sourcegear.annotations.dsl

import scala.util.matching.Regex

object RegexHelper {
  implicit class RichRegex(val underlying: Regex) {
    def matches(s: String): Boolean = underlying.pattern.matcher(s).matches
    def extract(s: String)(groupName: String): Option[String] = underlying.findFirstMatchIn(s).map(_.group(groupName))
  }
}