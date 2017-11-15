package com.opticdev.server

import akka.http.scaladsl.marshalling.ToResponseMarshallable

package object http {
  type HTTPResponse = ToResponseMarshallable
}
