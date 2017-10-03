package com

import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.server.StandardRoute

package object opticdev {
  type HTTPResponse = ToResponseMarshallable
}
