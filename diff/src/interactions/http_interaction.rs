pub struct HttpInteraction {
  pub uuid: String,
  pub request: Request,
  pub response: Response,
  pub tags: Vec<HttpInteractionTag>,
}

pub struct HttpInteractionTag {
  name: String,
  value: String,
}

pub struct Request {
  pub host: String,
  pub method: String,
  pub path: String,
  pub query: String,
  pub body: Body,
}

pub struct Response {
  status_code: u16,
  headers: ArbitraryData,
}

pub struct Body {
  content_type: Option<String>,
  value: ArbitraryData,
}

pub struct ArbitraryData {}
