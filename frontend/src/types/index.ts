// API Response Types
export interface Post {
  id: string;
  title: string;
  content?: string;
  contentMarkdown: string;
  contentHtml?: string;
  excerpt: string | null;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  tags: Array<{
    id?: string;
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  comments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
    };
  }>;
  _count?: {
    comments: number;
    likes: number;
  };
  views: Array<{
    id: string;
    count: number;
  }>;
  reactions: Array<{
    id: string;
    type: string;
    userId: string;
  }>;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  _count: {
    posts: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    pages: number;
  };
}

export interface TagsResponse {
  tags: Tag[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  message?: string;
}
