export type Standard = {
  config: {
    ruleset: { name: string; config: unknown }[];
  };
  name: string;
  slug: string;
  organization_id: string;
  ruleset_id: string;
  created_at: string;
  updated_at: string;
};

export type StandardConfig = { name: string; config: any }[];

export type Api = {
  api_id: string;
  organization_id: string;
  path: string;
};
