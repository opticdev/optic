import { IHttpInteraction, TestDataHelper } from '@useoptic/domain';
// @ts-ignore
import * as md5 from 'md5';
import { InteractionHelper } from './InteractionHelper';

interface ScenarioBlockContext {
  AddPath: (...components: string[]) => void;
  LearnBaseline: (...interactions: InteractionHelper[]) => void;
  // DiffAgainst: (interaction: IHttpInteraction) => void;

  when: (caseName: string, interaction: InteractionHelper, tag: string) => void;
}

interface StagedScenario {
  scenario: string;
  case: string;
  events: any[];
  tag: string;
  interaction: IHttpInteraction;
}

export function Scenario(
  name: string,
  block: (context: ScenarioBlockContext) => void
) {
  const commands: any[] = [];
  const prefix = md5(name).substr(0, 12);
  const helper = TestDataHelper.withPrefix(prefix);

  const scenarios: StagedScenario[] = [];

  const context: ScenarioBlockContext = {
    AddPath: (...components) => {
      const result = helper.AddPath(components);
      result.forEach((i: any) => commands.push(i));
    },
    LearnBaseline: (...interactions) => {
      const baselineInteractions = interactions.map((i, index) =>
        i.toInteraction(index.toString())
      );

      const result = helper.LearnBaseline(commands, baselineInteractions);
      result.forEach((i: any) => commands.push(i));
    },
    when: (caseName: string, interaction, tag: string) => {
      scenarios.push({
        scenario: name,
        case: caseName,
        events: [],
        tag,
        interaction: interaction.toInteraction('last'),
      });
    },
  };

  block(context);
  const events = helper.FinalizeEvents(commands);

  scenarios.forEach((s) => (s.events = events));
  scenarios.forEach((i) => allScenarios.push(i));

  return { commands, events, scenarios };
}

//storage
export const allScenarios: StagedScenario[] = [];
