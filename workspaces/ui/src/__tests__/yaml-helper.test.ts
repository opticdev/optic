import { rangesFromOpticYaml } from '../components/setup-page/yaml/YamlHelper';

const opticyaml = `name: Todo API
tasks:
  # The default task, invoke using \`api run start\`
  # Learn how to set up and use Optic at https://useoptic.com/docs/
  start:
    command: npm run server-start
    inboundUrl: http://localhost:3005
  start-ui:
    command: npm start
    useTask: start
  test:
    command: "mocha test1.js"
    useTask: start
  test-gets:
    command: "mocha test2.js"
    useTask: start

ignoreRequests:
# For more information on configuration, visit https://www.useoptic.com/docs/faqs-and-troubleshooting/captures
- OPTIONS (.*)
`.trim();

const opticyaml_missing_value = `name: Todo API
tasks:
  # The default task, invoke using \`api run start\`
  # Learn how to set up and use Optic at https://app.useoptic.com
  start:
    command:
    inboundUrl: http://localhost:3005
`.trim();

it('can parse a start task from optic yaml', () => {
  const result = rangesFromOpticYaml(opticyaml, 'start');
  expect(result).toMatchSnapshot();
});

it('can parse a test task from optic yaml', () => {
  const result = rangesFromOpticYaml(opticyaml, 'test-gets');
  expect(result).toMatchSnapshot();
});

it('fails gracefully when missing value', () => {
  const result = rangesFromOpticYaml(opticyaml_missing_value, 'start');
  expect(result).toMatchSnapshot();
});
