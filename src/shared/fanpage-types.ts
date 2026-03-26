export type FanPage = {
  id: string;
  name: string;
  pageAccessToken: string;
  pictureUrl: string;
  fanCount: number | null;
  followersCount: number | null;
  verificationStatus: string | null;
  category: string | null;
  link: string | null;
  isPublished: boolean | null;
};

export type ListFanPagesResult =
  | { ok: true; pages: FanPage[] }
  | { ok: false; code: 'NO_COOKIE' | 'INVALID' | 'NETWORK'; message?: string };
