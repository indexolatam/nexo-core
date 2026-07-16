import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

export const createPersonSchema = z.object({
  user_name_1: z.string().min(1).max(100),
  user_name_2: z.string().max(100).optional(),
  user_lastname_1: z.string().min(1).max(100),
  user_lastname_2: z.string().max(100).optional(),
  user_phone: z.string().min(7).max(30),
  user_email: z.string().email().max(200).optional(),
  user_status: z.enum(["Pendiente", "Activo", "Inactivo"]).optional().default("Pendiente"),
  user_phone_code: z.string().max(10).optional(),
  user_source: z.string().max(100).optional(),
  user_address: z.string().max(500).optional(),
  user_birth_date: z.string().max(10).optional(),
  user_gender: z.string().max(50).optional(),
  user_doc_id: z.string().max(50).optional(),
  user_notes: z.string().max(2000).optional(),
  user_types: z.array(z.string().max(100)).optional().default([]),
  user_tags: z.array(z.string().max(100)).optional().default([]),
});

export const updatePersonSchema = createPersonSchema.partial();

export const PERSON_UPDATE_WHITELIST = [
  "user_name_1","user_name_2","user_lastname_1","user_lastname_2",
  "user_phone","user_email","user_status","user_source",
  "user_address","user_birth_date","user_gender","user_doc_id","user_notes",
  "user_types","user_tags","user_admin_notes",
] as const;
