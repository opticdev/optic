![alt text](http://useoptic.com/imgs/headerlogo.png "Optic Logo")

# Optic
The engine behind [Optic's AI Pair Programming tool](http://useoptic.com/)

## [Product Docs](http://useoptic.com/docs/#/)

# Codebase

#### Technologies:
* **Scala 2.12** - targetting the JVM makes it easy to ensure consistency across all the operating systems without sacrifcing performance or productivity. 
* **Akka** - We use Akka for almost everything. Our server runs akka-http, we use akka-streams for communicating with IDEs and the Optic GUI over websockets, and the actor model has made our realtime processing very quick & reliable. 
* **JSON Schema** - JSON Schemas are used extensively throughout Optic as a de facto type system for knowledge. 
* **Scala Graph** - Graph library we use to map codebases and relationships between different kinds of code 

#### Project Structure:
```sh
optic/
├── common         # Common types and utilities used everywhere 
├── core           # Powers the Compiler, parsers, generators & mutators
├── opm            # Our Package Manager for resolving Optic Markdown
├── project        # sbt project folder. 
├── sdk            # Parses Optic Markdown into Scala Objects
├── server         # Local Optic Server & Final Product
└── test-examples  # Example Markdown, Packages & Code for Test Suites
```
#### Technical Overview 
Optic servers listen for state changes from Editors like Atom, Intellij and Vim. Those editors are constantly sending their state (cursor position and staged contents) to the server using a websocket. When results are found by the server those are forwarded to Optic's UI.

Users can interact with the Optic API through the UI we provide. When they submit changes to the server they are processed and then forwarded back to the Editors and written to the file system.
![alt text](http://useoptic.com/docs/images/system-overview.svg "Optic Logo")

#### Companion Projects 
There are several repos that we have chosen not to include in this monorepo:

* [marvin](https://github.com/opticdev/marvin): Marvin learns the structure of programming languages from thousands of examples and builds models trained to generate code from AST Trees.
* [optic-markdown](https://github.com/opticdev/optic-markdown): A spec for human & machine readable documentation. This is how optic is taught to generate and read certain kinds of code.
* [optic-editor-sdk](https://github.com/opticdev/optic-editor-sdk): A javascript library for connecting new IDEs to Optic
* [parser-foundation](https://github.com/opticdev/parser-foundation): A library & instructions for adding your favorite programming languages to Optic.
