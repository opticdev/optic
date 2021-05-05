export type AsyncStatus<T> =
  | {
      loading: true;
      error?: undefined;
      data?: undefined;
    }
  | {
      loading: false;
      error: Error;
      data?: undefined;
    }
  | { loading: false; error?: undefined; data: T };
