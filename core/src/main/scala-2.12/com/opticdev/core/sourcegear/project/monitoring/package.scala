package com.opticdev.core.sourcegear.project

import java.time.Instant

package object monitoring {
  case class StagedContent(text: String, lastEdited: Long = Instant.now.getEpochSecond)
}
