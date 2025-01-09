export interface ArticleQueryParams {
  tag?: string;
  author?: string;
  favorited?: string;
  limit?: number;
  offset?: number;
}

export interface JwtPayload {
  user: {
    id: number;
    email: string;
  };
}
