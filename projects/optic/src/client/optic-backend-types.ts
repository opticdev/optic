export type Standard = {
  config: {
    ruleset: { name: string; config: unknown }[];
  };
  organization_id: string;
  ruleset_id: string;
  created_at: string;
  updated_at: string;
};

export type StandardConfig = { name: string; config: any }[];
