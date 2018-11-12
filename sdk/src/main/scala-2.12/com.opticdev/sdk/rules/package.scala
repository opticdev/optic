package com.opticdev.sdk

package object rules {

  trait Rule {
    val isRawRule = false
    val isPropertyRule = false
    val isChildrenRule = false
    val isVariableRule = false
  }

}
