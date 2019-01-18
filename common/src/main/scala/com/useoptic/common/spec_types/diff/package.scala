package com.useoptic.common.spec_types

package object diff {
  trait APISpecChanges {
    def isAddition: Boolean = false
    def isRemoval: Boolean = false
    def isUpdate: Boolean = false
  }

}
