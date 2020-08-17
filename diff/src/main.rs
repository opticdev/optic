#![allow(dead_code, unused_imports)]
mod interactions;

use interactions::{diff, HttpInteraction};

fn main() {}

#[cfg(test)]
mod test {
    #[test]
    pub fn do_a_diff() {
        assert_eq!(true, true, "wouldn't you know");
    }
}
