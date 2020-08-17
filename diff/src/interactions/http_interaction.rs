pub struct HttpInteraction {
  uuid: String,
  request: Request,
  response: Response,
  tags: Vec<HttpInteractionTag>,
}

struct HttpInteractionTag {
  name: String,
  value: String,
}

pub struct Request {
  host: String,
  method: String,
  path: String,
  query: String,
  body: Body,
}

pub struct Response {
  status_code: u16,
  headers: ArbitraryData,
}

pub struct Body {
  content_type: Option<String>,
  value: ArbitraryData,
}

struct ArbitraryData {}
