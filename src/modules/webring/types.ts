export type SiteData = {
  id: number;
  slug: string;
  name: string;
  url: string;
  favicon?: string;
};

export type GetDataResponse = {
  prev: SiteData;
  curr: SiteData;
  next: SiteData;
};

export type APIResponse =
  | {
      status: true;
      data: GetDataResponse;
    }
  | {
      status: false;
      error: Error;
    };
