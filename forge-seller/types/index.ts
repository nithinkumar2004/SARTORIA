export type ProductStatus = "pending" | "processing" | "completed" | "failed";

export interface Profile {
  id: string;
  user_id: string;
  company_name: string;
  saturn_tier: string;
  created_at: string;
}

export interface Asset {
  id: string;
  product_id: string;
  raw_image_front_url: string;
  raw_image_back_url: string;
  model_3d_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  name: string;
  category: string;
  status: ProductStatus;
  created_at: string;
  asset?: Asset;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
      };
      products: {
        Row: Product;
      };
      assets: {
        Row: Asset;
      };
    };
  };
}
