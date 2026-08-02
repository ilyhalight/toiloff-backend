export type GraceCacheSystem<T> = {
  data: T;
  staleAt: number;
};

export type GraceCacheResult<T> = {
  data: T;
  isStale: boolean;
};
