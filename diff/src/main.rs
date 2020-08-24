use clap::{App, Arg};
use optic_diff::errors;
use optic_diff::SpecEvent;

fn main() {
    let cli = App::new("Optic Diff engine")
        .version("1.0")
        .author("Optic Labs Corporation")
        .about("Detects differences between API spec and captured interactions")
        .arg(
            Arg::with_name("specification")
                .required(true)
                .value_name("spec-file-path")
                .help("Sets the specification file that describes the API spec")
                .takes_value(true),
        );

    let matches = cli.get_matches();

    let spec_file_path = matches
        .value_of("specification")
        .expect("spec-file-path should be required");
    let events = SpecEvent::from_file(spec_file_path);

    match events {
        Ok(events) => {
            eprintln!("Read {} events from provided spec file", events.len());
        }
        Err(errors::EventLoadingError::Io(err)) => {
            eprintln!("Could not read specification file: {}", err);
        }
        Err(errors::EventLoadingError::Json(err)) => {
            eprintln!("Specification JSON file could not be parsed: {}", err);
        }
        _ => unreachable!("Specification file not currently serialized as any other but JSON"),
    };
}

#[cfg(test)]
mod test {
    #[test]
    pub fn do_a_diff() {
        assert_eq!(true, true, "wouldn't you know");
    }
}
