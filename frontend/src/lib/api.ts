import { Post, Tag, PostsResponse } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Get token from localStorage on client side
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Use external URL for client-side requests, internal URL for server-side
    const baseURL =
      typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_EXTERNAL_API_URL ||
          "http://localhost:3001/api"
        : process.env.NEXT_PUBLIC_API_URL || "http://backend:3001/api";

    const url = `${baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>)
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Network error" }));

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        // Clear invalid token
        this.setToken(null);
        // Only redirect to login if we have a token (user was trying to authenticate)
        if (
          this.token &&
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login";
        }
      }

      // Only log errors for authenticated requests or non-auth endpoints
      // Don't log 404 errors for posts as they might be private posts
      if (
        (this.token || !endpoint.includes("/auth/")) &&
        !(response.status === 404 && endpoint.includes("/posts/"))
      ) {
        console.error(
          `API Error for ${endpoint}:`,
          error,
          `Status: ${response.status}`
        );
      }
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{
      token: string;
      user: {
        id: string;
        name: string;
        email: string;
        image?: string;
        role: string;
      };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    this.setToken(response.token);
    return response;
  }

  async register(name: string, email: string, password: string) {
    const response = await this.request<{
      token: string;
      user: {
        id: string;
        name: string;
        email: string;
        image?: string;
        role: string;
      };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });

    this.setToken(response.token);
    return response;
  }

  async verifyToken() {
    // Don't make request if no token exists
    if (!this.token) {
      throw new Error("No authentication token found");
    }

    return this.request<{
      user: {
        id: string;
        name: string;
        email: string;
        image?: string;
        role: string;
      };
    }>("/auth/verify");
  }

  logout() {
    this.setToken(null);
  }

  // Google OAuth methods
  getGoogleAuthUrl() {
    // For OAuth redirects, we need to use the external URL that the browser can access
    const externalApiUrl =
      process.env.NEXT_PUBLIC_EXTERNAL_API_URL || "http://localhost:3001/api";
    return `${externalApiUrl}/auth/google`;
  }

  async handleGoogleCallback(token: string) {
    this.setToken(token);

    // Verify the token and get user info
    return this.verifyToken();
  }

  // Posts endpoints
  async getPosts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    tag?: string;
    status?: string;
    visibility?: "PUBLIC" | "PRIVATE";
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.tag) searchParams.set("tag", params.tag);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.visibility) searchParams.set("visibility", params.visibility);

    const query = searchParams.toString();
    return this.request<PostsResponse>(`/posts${query ? `?${query}` : ""}`);
  }

  async getUserPosts(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    return this.request<PostsResponse>(
      `/posts/my-posts${query ? `?${query}` : ""}`
    );
  }

  async getPostBySlug(slug: string) {
    return this.request<Post>(`/posts/slug/${slug}`);
  }

  async getPostById(id: string) {
    return this.request<Post>(`/posts/${id}`);
  }

  async createPost(data: {
    title: string;
    slug?: string;
    contentMarkdown: string;
    excerpt?: string;
    tagIds?: string[];
    status?: "DRAFT" | "PUBLISHED";
    visibility?: "PUBLIC" | "PRIVATE";
  }) {
    return this.request<Post>("/posts", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  async updatePost(
    id: string,
    data: {
      title: string;
      slug: string;
      contentMarkdown: string;
      excerpt?: string;
      status?: "DRAFT" | "PUBLISHED";
      visibility?: "PUBLIC" | "PRIVATE";
      tagIds?: string[];
    }
  ) {
    return this.request<Post>(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }

  async deletePost(id: string) {
    return this.request<{ message: string }>(`/posts/${id}`, {
      method: "DELETE"
    });
  }

  async unpublishPost(id: string) {
    return this.request<{ message: string; post: Post }>(
      `/posts/${id}/unpublish`,
      {
        method: "POST"
      }
    );
  }

  async likePost(id: string) {
    return this.request<{ liked: boolean }>(`/posts/${id}/like`, {
      method: "POST"
    });
  }

  // Comments endpoints
  async getComments(postId: string) {
    return this.request<
      {
        id: string;
        content: string;
        createdAt: string;
        author: { id: string; name: string };
      }[]
    >(`/comments/posts/${postId}`);
  }

  async createComment(postId: string, content: string) {
    return this.request<{
      id: string;
      content: string;
      createdAt: string;
      author: { id: string; name: string };
    }>(`/comments/posts/${postId}`, {
      method: "POST",
      body: JSON.stringify({ content })
    });
  }

  async deleteComment(commentId: string) {
    return this.request<{ message: string }>(`/comments/${commentId}`, {
      method: "DELETE"
    });
  }

  // Tags endpoints
  async getTags() {
    return this.request<Tag[]>("/tags");
  }

  async createTag(name: string) {
    return this.request<Tag>("/tags", {
      method: "POST",
      body: JSON.stringify({ name })
    });
  }

  async deleteTag(id: string) {
    return this.request<{ message: string }>(`/tags/${id}`, {
      method: "DELETE"
    });
  }

  async cleanupTags() {
    return this.request<{ message: string; deletedCount: number }>(
      "/tags/cleanup",
      {
        method: "POST"
      }
    );
  }

  // Health endpoint
  async healthCheck() {
    return this.request<{
      status: string;
      database: string;
      timestamp: string;
      service: string;
    }>("/health");
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
