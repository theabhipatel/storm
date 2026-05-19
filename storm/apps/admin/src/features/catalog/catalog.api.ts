import { catalogMediaApi } from "../../store/apiSlice";

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}
export interface CategoryTreeNode extends CategoryDto {
  children: CategoryTreeNode[];
}

export interface BrandDto {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = "draft" | "published" | "archived";

export interface VariantDto {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number | null;
  attributes: Record<string, string | number | boolean>;
}

export interface ProductMediaDto {
  mediaId: string;
  order: number;
  isPrimary: boolean;
}

export interface ProductDetail {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  brandId: string;
  categoryId: string;
  basePrice: number;
  currency: string;
  status: ProductStatus;
  attributes: Record<string, string | number | boolean>;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  variants: VariantDto[];
  media: ProductMediaDto[];
}

export interface AdminProductSummary {
  id: string;
  sku: string;
  slug: string;
  name: string;
  status: ProductStatus;
  brandId: string;
  categoryId: string;
  basePrice: number;
  currency: string;
  primaryMediaId: string | null;
  updatedAt: string;
}

export interface ProductListResponse {
  items: AdminProductSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductListFilters {
  q?: string | undefined;
  status?: ProductStatus | "" | undefined;
  categoryId?: string | undefined;
  brandId?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

const api = catalogMediaApi.injectEndpoints({
  endpoints: (build) => ({
    // Categories
    listCategoryTree: build.query<{ items: CategoryTreeNode[] }, void>({
      query: () => ({ client: "catalog", url: "/api/categories" }),
      providesTags: ["Categories"],
    }),
    createCategory: build.mutation<
      CategoryDto,
      { name: string; parentId?: string | null; order?: number; slug?: string }
    >({
      query: (body) => ({
        client: "catalog",
        url: "/api/admin/categories",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: build.mutation<
      CategoryDto,
      { id: string; data: Partial<{ name: string; slug: string; parentId: string | null; order: number }> }
    >({
      query: ({ id, data }) => ({
        client: "catalog",
        url: `/api/admin/categories/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: build.mutation<void, string>({
      query: (id) => ({
        client: "catalog",
        url: `/api/admin/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),

    // Brands
    listBrands: build.query<{ items: BrandDto[] }, void>({
      query: () => ({ client: "catalog", url: "/api/brands" }),
      providesTags: ["Brands"],
    }),
    createBrand: build.mutation<BrandDto, { name: string; slug?: string }>({
      query: (body) => ({
        client: "catalog",
        url: "/api/admin/brands",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Brands"],
    }),
    updateBrand: build.mutation<
      BrandDto,
      { id: string; data: { name?: string; slug?: string } }
    >({
      query: ({ id, data }) => ({
        client: "catalog",
        url: `/api/admin/brands/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Brands"],
    }),
    deleteBrand: build.mutation<void, string>({
      query: (id) => ({
        client: "catalog",
        url: `/api/admin/brands/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Brands"],
    }),

    // Products
    listProducts: build.query<ProductListResponse, ProductListFilters>({
      query: (filters) => {
        const params: Record<string, string | number> = {
          page: filters.page ?? 1,
          pageSize: filters.pageSize ?? 20,
        };
        if (filters.q) params["q"] = filters.q;
        if (filters.status) params["status"] = filters.status;
        if (filters.categoryId) params["categoryId"] = filters.categoryId;
        if (filters.brandId) params["brandId"] = filters.brandId;
        return { client: "catalog", url: "/api/admin/products", params };
      },
      providesTags: (res) =>
        res
          ? [
              ...res.items.map((p) => ({ type: "Product" as const, id: p.id })),
              { type: "Products" as const, id: "LIST" },
            ]
          : [{ type: "Products" as const, id: "LIST" }],
    }),
    getProduct: build.query<ProductDetail, string>({
      query: (id) => ({ client: "catalog", url: `/api/admin/products/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),
    createProduct: build.mutation<
      ProductDetail,
      {
        sku: string;
        slug?: string;
        name: string;
        description?: string;
        brandId: string;
        categoryId: string;
        basePrice: number;
        attributes?: Record<string, string | number | boolean>;
      }
    >({
      query: (body) => ({
        client: "catalog",
        url: "/api/admin/products",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
    updateProduct: build.mutation<
      ProductDetail,
      {
        id: string;
        data: Partial<{
          sku: string;
          slug: string;
          name: string;
          description: string;
          brandId: string;
          categoryId: string;
          basePrice: number;
          attributes: Record<string, string | number | boolean>;
        }>;
      }
    >({
      query: ({ id, data }) => ({
        client: "catalog",
        url: `/api/admin/products/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Product", id },
        { type: "Products", id: "LIST" },
      ],
    }),
    publishProduct: build.mutation<ProductDetail, string>({
      query: (id) => ({
        client: "catalog",
        url: `/api/admin/products/${id}/publish`,
        method: "POST",
        data: {},
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Product", id },
        { type: "Products", id: "LIST" },
      ],
    }),
    archiveProduct: build.mutation<ProductDetail, string>({
      query: (id) => ({
        client: "catalog",
        url: `/api/admin/products/${id}/archive`,
        method: "POST",
        data: {},
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Product", id },
        { type: "Products", id: "LIST" },
      ],
    }),
    restoreProduct: build.mutation<ProductDetail, string>({
      query: (id) => ({
        client: "catalog",
        url: `/api/admin/products/${id}/restore`,
        method: "POST",
        data: {},
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Product", id },
        { type: "Products", id: "LIST" },
      ],
    }),

    addVariant: build.mutation<
      VariantDto,
      {
        productId: string;
        data: {
          sku: string;
          name: string;
          price?: number | null;
          attributes?: Record<string, string | number | boolean>;
        };
      }
    >({
      query: ({ productId, data }) => ({
        client: "catalog",
        url: `/api/admin/products/${productId}/variants`,
        method: "POST",
        data,
      }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: "Product", id: productId }],
    }),
    updateVariant: build.mutation<
      VariantDto,
      {
        productId: string;
        variantId: string;
        data: Partial<{
          sku: string;
          name: string;
          price: number | null;
          attributes: Record<string, string | number | boolean>;
        }>;
      }
    >({
      query: ({ productId, variantId, data }) => ({
        client: "catalog",
        url: `/api/admin/products/${productId}/variants/${variantId}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: "Product", id: productId }],
    }),
    deleteVariant: build.mutation<void, { productId: string; variantId: string }>({
      query: ({ productId, variantId }) => ({
        client: "catalog",
        url: `/api/admin/products/${productId}/variants/${variantId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: "Product", id: productId }],
    }),

    attachMedia: build.mutation<
      void,
      {
        productId: string;
        mediaId: string;
        order?: number;
        isPrimary?: boolean;
      }
    >({
      query: ({ productId, ...body }) => ({
        client: "catalog",
        url: `/api/admin/products/${productId}/media`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: "Product", id: productId }],
    }),
    detachMedia: build.mutation<void, { productId: string; mediaId: string }>({
      query: ({ productId, mediaId }) => ({
        client: "catalog",
        url: `/api/admin/products/${productId}/media/${mediaId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: "Product", id: productId }],
    }),
  }),
});

export const {
  useListCategoryTreeQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useListBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useListProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  usePublishProductMutation,
  useArchiveProductMutation,
  useRestoreProductMutation,
  useAddVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
  useAttachMediaMutation,
  useDetachMediaMutation,
} = api;
