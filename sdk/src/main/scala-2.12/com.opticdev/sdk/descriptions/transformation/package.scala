package com.opticdev.sdk.descriptions

import jdk.nashorn.api.scripting.ScriptObjectMirror

package object transformation {
  case class DynamicAsk(key: String, description: String, code: ScriptObjectMirror)
}
