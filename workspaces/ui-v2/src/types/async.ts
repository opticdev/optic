export type AsyncStatus<T, E = Error> =
  | {
      loading: true;
      error?: undefined;
      data?: undefined;
    }
  | {
      loading: false;
      error: E;
      data?: undefined;
    }
  | { loading: false; error?: undefined; data: T };
