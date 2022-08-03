export const supportedCIs = ['github-action'] as const;
export type SupportedCI = typeof supportedCIs[number];
