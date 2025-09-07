import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";

// Create DOMPurify instance
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window as any);

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

export function validatePostTitle(title: string): ValidationResult {
  const errors: string[] = [];

  if (!title || typeof title !== "string") {
    errors.push("Title is required");
    return { isValid: false, errors };
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length === 0) {
    errors.push("Title cannot be empty");
    return { isValid: false, errors };
  }

  if (trimmedTitle.length > 200) {
    errors.push("Title must be less than 200 characters");
  }

  const sanitized = DOMPurify.sanitize(trimmedTitle);

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  };
}

export function validatePostContent(content: string): ValidationResult {
  const errors: string[] = [];

  if (!content || typeof content !== "string") {
    errors.push("Content is required");
    return { isValid: false, errors };
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length === 0) {
    errors.push("Content cannot be empty");
    return { isValid: false, errors };
  }

  if (trimmedContent.length > 50000) {
    errors.push("Content must be less than 50,000 characters");
  }

  const sanitized = DOMPurify.sanitize(trimmedContent);

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  };
}

export function validatePostSlug(slug: string): ValidationResult {
  const errors: string[] = [];

  if (!slug || typeof slug !== "string") {
    errors.push("Slug is required");
    return { isValid: false, errors };
  }

  const trimmedSlug = slug.trim();

  if (trimmedSlug.length === 0) {
    errors.push("Slug cannot be empty");
    return { isValid: false, errors };
  }

  if (trimmedSlug.length < 3) {
    errors.push("Slug must be at least 3 characters long");
  }

  if (trimmedSlug.length > 100) {
    errors.push("Slug must be less than 100 characters");
  }

  // Check for valid slug format (alphanumeric, hyphens, underscores)
  if (!/^[a-z0-9-_]+$/.test(trimmedSlug)) {
    errors.push(
      "Slug can only contain lowercase letters, numbers, hyphens, and underscores"
    );
  }

  const sanitized = DOMPurify.sanitize(trimmedSlug);

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  };
}

export function validateTagName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || typeof name !== "string") {
    errors.push("Tag name is required");
    return { isValid: false, errors };
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    errors.push("Tag name cannot be empty");
    return { isValid: false, errors };
  }

  if (trimmedName.length < 2) {
    errors.push("Tag name must be at least 2 characters long");
  }

  if (trimmedName.length > 30) {
    errors.push("Tag name must be less than 30 characters");
  }

  const sanitized = DOMPurify.sanitize(trimmedName);

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  };
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email || typeof email !== "string") {
    errors.push("Email is required");
    return { isValid: false, errors };
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (trimmedEmail.length === 0) {
    errors.push("Email cannot be empty");
    return { isValid: false, errors };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    errors.push("Please enter a valid email address");
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: trimmedEmail
  };
}

export function validateCommentContent(content: string): ValidationResult {
  const errors: string[] = [];

  if (!content || typeof content !== "string") {
    errors.push("Comment content is required");
    return { isValid: false, errors };
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length === 0) {
    errors.push("Comment cannot be empty");
    return { isValid: false, errors };
  }

  if (trimmedContent.length < 5) {
    errors.push("Comment must be at least 5 characters long");
  }

  if (trimmedContent.length > 1000) {
    errors.push("Comment must be less than 1000 characters");
  }

  const sanitized = DOMPurify.sanitize(trimmedContent);

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
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
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "a",
      "img",
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
      "href",
      "src",
      "alt",
      "title",
      "class",
      "id",
      "target",
      "rel",
      "width",
      "height"
    ]
  });
}
