package com.seamless.contexts.rfc

import com.seamless.contexts.data_types.{DataTypesAggregate, DataTypesState}

case class RfcState(dataTypes: DataTypesState = DataTypesAggregate.initialState)