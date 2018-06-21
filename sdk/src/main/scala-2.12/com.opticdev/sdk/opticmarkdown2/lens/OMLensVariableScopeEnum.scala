package com.opticdev.sdk.opticmarkdown2.lens

import com.opticdev.sdk.descriptions.enums.VariableEnums.InEnum

sealed trait OMLensVariableScopeEnum

case object Self extends OMLensVariableScopeEnum
case object Scope extends OMLensVariableScopeEnum