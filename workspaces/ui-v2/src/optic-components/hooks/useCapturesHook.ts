export function useCapturesHook(): {
  captures: ICaptures[];
  loading?: boolean;
  error?: any;
} {
  return { captures: [] };
}

export interface ICaptures {
  captureId: string;
  startedAt: string;
}
