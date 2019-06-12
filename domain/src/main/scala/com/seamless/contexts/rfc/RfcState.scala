package com.seamless.contexts.rfc

import com.seamless.contexts.data_types.{DataTypesState}
import com.seamless.contexts.requests.RequestsState

case class RfcState(requestsState: RequestsState, dataTypesState: DataTypesState) {
  def updateDataTypes(dataTypesState: DataTypesState) = {
    this.copy(dataTypesState = dataTypesState)
  }
}
