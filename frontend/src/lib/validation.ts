import DOMPurify from "isomorphic-dompurify";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

export function validatePostTitle(title: string): ValidationResult {
  const errors: string[] = [];

  if (!title || typeof title !== "string") {
    errors.push("Title is required");
  } else {
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      errors.push("Title cannot be empty");
    } else if (trimmed.length < 3) {
      errors.push("Title must be at least 3 characters long");
    } else if (trimmed.length > 200) {
      errors.push("Title must be less than 200 characters");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: title ? DOMPurify.sanitize(title.trim()) : undefined
  };
}

export function validatePostContent(content: string): ValidationResult {
  const errors: string[] = [];

  if (!content || typeof content !== "string") {
    errors.push("Content is required");
  } else {
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      errors.push("Content cannot be empty");
    } else if (trimmed.length < 10) {
      errors.push("Content must be at least 10 characters long");
    } else if (trimmed.length > 50000) {
      errors.push("Content must be less than 50,000 characters");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: content ? DOMPurify.sanitize(content) : undefined
  };
}

export function validateCommentContent(content: string): ValidationResult {
  const errors: string[] = [];

  if (!content || typeof content !== "string") {
    errors.push("Comment is required");
  } else {
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      errors.push("Comment cannot be empty");
    } else if (trimmed.length < 5) {
      errors.push("Comment must be at least 5 characters long");
    } else if (trimmed.length > 1000) {
      errors.push("Comment must be less than 1,000 characters");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: content ? DOMPurify.sanitize(content) : undefined
  };
}

export function validatePostSlug(slug: string): ValidationResult {
  const errors: string[] = [];

  if (!slug || typeof slug !== "string") {
    errors.push("Slug is required");
  } else {
    const trimmed = slug.trim();
    if (trimmed.length === 0) {
      errors.push("Slug cannot be empty");
    } else if (trimmed.length < 3) {
      errors.push("Slug must be at least 3 characters long");
    } else if (!/^[a-z0-9-]+$/.test(trimmed)) {
      errors.push(
        "Slug can only contain lowercase letters, numbers, and hyphens"
      );
    } else if (trimmed.length > 100) {
      errors.push("Slug must be less than 100 characters");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: slug ? slug.trim().toLowerCase() : undefined
  };
}

export function validateTagName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || typeof name !== "string") {
    errors.push("Tag name is required");
  } else {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      errors.push("Tag name cannot be empty");
    } else if (trimmed.length < 2) {
      errors.push("Tag name must be at least 2 characters long");
    } else if (trimmed.length > 50) {
      errors.push("Tag name must be less than 50 characters");
    } else if (!/^[a-zA-Z0-9\s-]+$/.test(trimmed)) {
      errors.push(
        "Tag name can only contain letters, numbers, spaces, and hyphens"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: name ? DOMPurify.sanitize(name.trim()) : undefined
  };
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email || typeof email !== "string") {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push("Please enter a valid email address");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: email ? email.trim().toLowerCase() : undefined
  };
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "del",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "a",
      "img",
      "figure",
      "figcaption",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "div",
      "span"
    ],
    ALLOWED_ATTR: [
      "class",
      "id",
      "href",
      "title",
      "target",
      "rel",
      "src",
      "alt",
      "width",
      "height",
      "loading",
      "scope",
      "colspan",
      "rowspan"
    ]
  });
}
