package com.opticdev.opm

import com.opticdev.common.PackageRef

package object packages {
  type DependencyMapping = Map[PackageRef, PackageRef]
}
