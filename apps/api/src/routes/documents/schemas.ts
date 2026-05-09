import type {
  ProcessUrlRequest,
  SaveDocumentRequest,
  UpdateDocumentRequest,
} from "@documind/types";
import { z } from "zod";

export const ProcessUrlRequestSchema = z.object({
  url: z.string().url(),
}) satisfies z.ZodType<ProcessUrlRequest>;

type DocumentListItemInput = {
  text: string;
  marker?: string;
  children?: DocumentListItemInput[];
};

const DocumentListItemSchema: z.ZodType<DocumentListItemInput> = z.lazy(() =>
  z.object({
    text: z.string(),
    marker: z.string().optional(),
    children: z.array(DocumentListItemSchema).optional(),
  }),
);

export const DocumentBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("heading"),
    text: z.string(),
    level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]).optional(),
  }),
  z.object({ type: z.literal("paragraph"), text: z.string() }),
  z.object({
    type: z.literal("list"),
    ordered: z.boolean().optional(),
    items: z.array(z.union([z.string(), DocumentListItemSchema])),
  }),
  z.object({ type: z.literal("divider") }),
]);

export const SaveDocumentRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  renderedHtml: z.string().optional(),
  rawText: z.string().optional(),
  blocks: z.array(DocumentBlockSchema).optional(),
  sourceType: z.string().optional(),
  sourceName: z.string().optional(),
  sourceMimeType: z.string().optional(),
  originalUrl: z.string().min(1).optional(),
  original_url: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
}) satisfies z.ZodType<SaveDocumentRequest>;

export const UpdateDocumentRequestSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").optional(),
  content: z.string().min(1, "Content cannot be empty").optional(),
  renderedHtml: z.string().min(1).optional(),
  rawText: z.string().optional(),
  blocks: z.array(DocumentBlockSchema).optional(),
  sourceType: z.string().optional(),
  sourceName: z.string().optional(),
  sourceMimeType: z.string().optional(),
  originalUrl: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
}) satisfies z.ZodType<UpdateDocumentRequest>;
