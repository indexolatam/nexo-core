export type BankConfig = {
  id: string;
  name: string;
  enabled: boolean;
};

export type ServiceConfig = {
  id: string;
  name: string;
  duration: number;
  price: number;
  active: boolean;
};

export type UserConfig = {
  id: string;
  name: string;
  role: string;
  active: boolean;
};

export type BlogPostStatus = "Borrador" | "Publicado";

export type BlogPostConfig = {
  id: string;
  title: string;
  status: BlogPostStatus;
  tags: string;
  content: string;
  image: string;
  date: string;
};