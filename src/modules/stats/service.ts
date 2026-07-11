import { humanFormat } from "@/shared/utils";

export abstract class StatsService {
  static async getStats() {
    return {
      github: {
        stars: humanFormat(7000),
        commits: humanFormat(6100),
      },
      tokens: {
        month: humanFormat(118800000),
        total: humanFormat(118800000),
      },
    };
  }
}
