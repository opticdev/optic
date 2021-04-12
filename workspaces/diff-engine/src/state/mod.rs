pub mod body;
pub mod endpoint;
pub mod shape;

pub trait SpecIdGenerator {
  fn generate_id(&mut self, prefix: &str) -> String;

  fn field(&mut self) -> String {
    self.generate_id("field_")
  }

  fn request(&mut self) -> String {
    self.generate_id("request_")
  }

  fn response(&mut self) -> String {
    self.generate_id("response_")
  }

  fn shape(&mut self) -> String {
    self.generate_id("shape_")
  }

  fn shape_param(&mut self) -> String {
    self.generate_id("shape_param_")
  }
}
