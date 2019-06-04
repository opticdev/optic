package com.seamless.contexts.rfc

import com.seamless.contexts.data_types.{DataTypesAggregate, DataTypesState}
import com.seamless.contexts.rest.{RestAggregate, RestState}

case class RfcState(restState: RestState = RestAggregate.initialState) {
  def updateDataTypes(dataTypesState: DataTypesState) = {
    this.copy(restState = restState.copy(dataTypesState = dataTypesState))
  }
}
