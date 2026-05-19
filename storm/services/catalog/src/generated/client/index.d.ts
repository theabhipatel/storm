
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Category
 * 
 */
export type Category = $Result.DefaultSelection<Prisma.$CategoryPayload>
/**
 * Model Brand
 * 
 */
export type Brand = $Result.DefaultSelection<Prisma.$BrandPayload>
/**
 * Model Product
 * 
 */
export type Product = $Result.DefaultSelection<Prisma.$ProductPayload>
/**
 * Model Variant
 * 
 */
export type Variant = $Result.DefaultSelection<Prisma.$VariantPayload>
/**
 * Model ProductMedia
 * 
 */
export type ProductMedia = $Result.DefaultSelection<Prisma.$ProductMediaPayload>
/**
 * Model Outbox
 * 
 */
export type Outbox = $Result.DefaultSelection<Prisma.$OutboxPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const ProductStatus: {
  draft: 'draft',
  published: 'published',
  archived: 'archived'
};

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus]

}

export type ProductStatus = $Enums.ProductStatus

export const ProductStatus: typeof $Enums.ProductStatus

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Categories
 * const categories = await prisma.category.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Categories
   * const categories = await prisma.category.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.category`: Exposes CRUD operations for the **Category** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Categories
    * const categories = await prisma.category.findMany()
    * ```
    */
  get category(): Prisma.CategoryDelegate<ExtArgs>;

  /**
   * `prisma.brand`: Exposes CRUD operations for the **Brand** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Brands
    * const brands = await prisma.brand.findMany()
    * ```
    */
  get brand(): Prisma.BrandDelegate<ExtArgs>;

  /**
   * `prisma.product`: Exposes CRUD operations for the **Product** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.product.findMany()
    * ```
    */
  get product(): Prisma.ProductDelegate<ExtArgs>;

  /**
   * `prisma.variant`: Exposes CRUD operations for the **Variant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Variants
    * const variants = await prisma.variant.findMany()
    * ```
    */
  get variant(): Prisma.VariantDelegate<ExtArgs>;

  /**
   * `prisma.productMedia`: Exposes CRUD operations for the **ProductMedia** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProductMedias
    * const productMedias = await prisma.productMedia.findMany()
    * ```
    */
  get productMedia(): Prisma.ProductMediaDelegate<ExtArgs>;

  /**
   * `prisma.outbox`: Exposes CRUD operations for the **Outbox** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Outboxes
    * const outboxes = await prisma.outbox.findMany()
    * ```
    */
  get outbox(): Prisma.OutboxDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.20.0
   * Query Engine version: 06fc58a368dc7be9fbbbe894adf8d445d208c284
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Category: 'Category',
    Brand: 'Brand',
    Product: 'Product',
    Variant: 'Variant',
    ProductMedia: 'ProductMedia',
    Outbox: 'Outbox'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "category" | "brand" | "product" | "variant" | "productMedia" | "outbox"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Category: {
        payload: Prisma.$CategoryPayload<ExtArgs>
        fields: Prisma.CategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          findFirst: {
            args: Prisma.CategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          findMany: {
            args: Prisma.CategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[]
          }
          create: {
            args: Prisma.CategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          createMany: {
            args: Prisma.CategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[]
          }
          delete: {
            args: Prisma.CategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          update: {
            args: Prisma.CategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          deleteMany: {
            args: Prisma.CategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          aggregate: {
            args: Prisma.CategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCategory>
          }
          groupBy: {
            args: Prisma.CategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<CategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.CategoryCountArgs<ExtArgs>
            result: $Utils.Optional<CategoryCountAggregateOutputType> | number
          }
        }
      }
      Brand: {
        payload: Prisma.$BrandPayload<ExtArgs>
        fields: Prisma.BrandFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BrandFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BrandFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>
          }
          findFirst: {
            args: Prisma.BrandFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BrandFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>
          }
          findMany: {
            args: Prisma.BrandFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>[]
          }
          create: {
            args: Prisma.BrandCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>
          }
          createMany: {
            args: Prisma.BrandCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BrandCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>[]
          }
          delete: {
            args: Prisma.BrandDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>
          }
          update: {
            args: Prisma.BrandUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>
          }
          deleteMany: {
            args: Prisma.BrandDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BrandUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BrandUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>
          }
          aggregate: {
            args: Prisma.BrandAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBrand>
          }
          groupBy: {
            args: Prisma.BrandGroupByArgs<ExtArgs>
            result: $Utils.Optional<BrandGroupByOutputType>[]
          }
          count: {
            args: Prisma.BrandCountArgs<ExtArgs>
            result: $Utils.Optional<BrandCountAggregateOutputType> | number
          }
        }
      }
      Product: {
        payload: Prisma.$ProductPayload<ExtArgs>
        fields: Prisma.ProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findFirst: {
            args: Prisma.ProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findMany: {
            args: Prisma.ProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          create: {
            args: Prisma.ProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          createMany: {
            args: Prisma.ProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          delete: {
            args: Prisma.ProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          update: {
            args: Prisma.ProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          deleteMany: {
            args: Prisma.ProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          aggregate: {
            args: Prisma.ProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct>
          }
          groupBy: {
            args: Prisma.ProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductCountArgs<ExtArgs>
            result: $Utils.Optional<ProductCountAggregateOutputType> | number
          }
        }
      }
      Variant: {
        payload: Prisma.$VariantPayload<ExtArgs>
        fields: Prisma.VariantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VariantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VariantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>
          }
          findFirst: {
            args: Prisma.VariantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VariantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>
          }
          findMany: {
            args: Prisma.VariantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>[]
          }
          create: {
            args: Prisma.VariantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>
          }
          createMany: {
            args: Prisma.VariantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VariantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>[]
          }
          delete: {
            args: Prisma.VariantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>
          }
          update: {
            args: Prisma.VariantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>
          }
          deleteMany: {
            args: Prisma.VariantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VariantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.VariantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>
          }
          aggregate: {
            args: Prisma.VariantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVariant>
          }
          groupBy: {
            args: Prisma.VariantGroupByArgs<ExtArgs>
            result: $Utils.Optional<VariantGroupByOutputType>[]
          }
          count: {
            args: Prisma.VariantCountArgs<ExtArgs>
            result: $Utils.Optional<VariantCountAggregateOutputType> | number
          }
        }
      }
      ProductMedia: {
        payload: Prisma.$ProductMediaPayload<ExtArgs>
        fields: Prisma.ProductMediaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductMediaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMediaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductMediaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMediaPayload>
          }
          findFirst: {
            args: Prisma.ProductMediaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMediaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductMediaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMediaPayload>
          }
          findMany: {
            args: Prisma.ProductMediaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMediaPayload>[]
          }
          create: {
            args: Prisma.ProductMediaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMediaPayload>
          }
          createMany: {
            args: Prisma.ProductMediaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductMediaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMediaPayload>[]
          }
          delete: {
            args: Prisma.ProductMediaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMediaPayload>
          }
          update: {
            args: Prisma.ProductMediaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMediaPayload>
          }
          deleteMany: {
            args: Prisma.ProductMediaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductMediaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProductMediaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMediaPayload>
          }
          aggregate: {
            args: Prisma.ProductMediaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProductMedia>
          }
          groupBy: {
            args: Prisma.ProductMediaGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductMediaGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductMediaCountArgs<ExtArgs>
            result: $Utils.Optional<ProductMediaCountAggregateOutputType> | number
          }
        }
      }
      Outbox: {
        payload: Prisma.$OutboxPayload<ExtArgs>
        fields: Prisma.OutboxFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OutboxFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OutboxFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>
          }
          findFirst: {
            args: Prisma.OutboxFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OutboxFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>
          }
          findMany: {
            args: Prisma.OutboxFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>[]
          }
          create: {
            args: Prisma.OutboxCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>
          }
          createMany: {
            args: Prisma.OutboxCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OutboxCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>[]
          }
          delete: {
            args: Prisma.OutboxDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>
          }
          update: {
            args: Prisma.OutboxUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>
          }
          deleteMany: {
            args: Prisma.OutboxDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OutboxUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OutboxUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>
          }
          aggregate: {
            args: Prisma.OutboxAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOutbox>
          }
          groupBy: {
            args: Prisma.OutboxGroupByArgs<ExtArgs>
            result: $Utils.Optional<OutboxGroupByOutputType>[]
          }
          count: {
            args: Prisma.OutboxCountArgs<ExtArgs>
            result: $Utils.Optional<OutboxCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CategoryCountOutputType
   */

  export type CategoryCountOutputType = {
    children: number
    products: number
  }

  export type CategoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    children?: boolean | CategoryCountOutputTypeCountChildrenArgs
    products?: boolean | CategoryCountOutputTypeCountProductsArgs
  }

  // Custom InputTypes
  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryCountOutputType
     */
    select?: CategoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountChildrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CategoryWhereInput
  }

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
  }


  /**
   * Count Type BrandCountOutputType
   */

  export type BrandCountOutputType = {
    products: number
  }

  export type BrandCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    products?: boolean | BrandCountOutputTypeCountProductsArgs
  }

  // Custom InputTypes
  /**
   * BrandCountOutputType without action
   */
  export type BrandCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandCountOutputType
     */
    select?: BrandCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BrandCountOutputType without action
   */
  export type BrandCountOutputTypeCountProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
  }


  /**
   * Count Type ProductCountOutputType
   */

  export type ProductCountOutputType = {
    variants: number
    media: number
  }

  export type ProductCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    variants?: boolean | ProductCountOutputTypeCountVariantsArgs
    media?: boolean | ProductCountOutputTypeCountMediaArgs
  }

  // Custom InputTypes
  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCountOutputType
     */
    select?: ProductCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeCountVariantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VariantWhereInput
  }

  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeCountMediaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductMediaWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Category
   */

  export type AggregateCategory = {
    _count: CategoryCountAggregateOutputType | null
    _avg: CategoryAvgAggregateOutputType | null
    _sum: CategorySumAggregateOutputType | null
    _min: CategoryMinAggregateOutputType | null
    _max: CategoryMaxAggregateOutputType | null
  }

  export type CategoryAvgAggregateOutputType = {
    order: number | null
  }

  export type CategorySumAggregateOutputType = {
    order: number | null
  }

  export type CategoryMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    parentId: string | null
    order: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CategoryMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    parentId: string | null
    order: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CategoryCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    parentId: number
    order: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CategoryAvgAggregateInputType = {
    order?: true
  }

  export type CategorySumAggregateInputType = {
    order?: true
  }

  export type CategoryMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    parentId?: true
    order?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CategoryMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    parentId?: true
    order?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CategoryCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    parentId?: true
    order?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Category to aggregate.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Categories
    **/
    _count?: true | CategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CategoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CategorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CategoryMaxAggregateInputType
  }

  export type GetCategoryAggregateType<T extends CategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCategory[P]>
      : GetScalarType<T[P], AggregateCategory[P]>
  }




  export type CategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CategoryWhereInput
    orderBy?: CategoryOrderByWithAggregationInput | CategoryOrderByWithAggregationInput[]
    by: CategoryScalarFieldEnum[] | CategoryScalarFieldEnum
    having?: CategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CategoryCountAggregateInputType | true
    _avg?: CategoryAvgAggregateInputType
    _sum?: CategorySumAggregateInputType
    _min?: CategoryMinAggregateInputType
    _max?: CategoryMaxAggregateInputType
  }

  export type CategoryGroupByOutputType = {
    id: string
    name: string
    slug: string
    parentId: string | null
    order: number
    createdAt: Date
    updatedAt: Date
    _count: CategoryCountAggregateOutputType | null
    _avg: CategoryAvgAggregateOutputType | null
    _sum: CategorySumAggregateOutputType | null
    _min: CategoryMinAggregateOutputType | null
    _max: CategoryMaxAggregateOutputType | null
  }

  type GetCategoryGroupByPayload<T extends CategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CategoryGroupByOutputType[P]>
            : GetScalarType<T[P], CategoryGroupByOutputType[P]>
        }
      >
    >


  export type CategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    parentId?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parent?: boolean | Category$parentArgs<ExtArgs>
    children?: boolean | Category$childrenArgs<ExtArgs>
    products?: boolean | Category$productsArgs<ExtArgs>
    _count?: boolean | CategoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["category"]>

  export type CategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    parentId?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parent?: boolean | Category$parentArgs<ExtArgs>
  }, ExtArgs["result"]["category"]>

  export type CategorySelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    parentId?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Category$parentArgs<ExtArgs>
    children?: boolean | Category$childrenArgs<ExtArgs>
    products?: boolean | Category$productsArgs<ExtArgs>
    _count?: boolean | CategoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CategoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Category$parentArgs<ExtArgs>
  }

  export type $CategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Category"
    objects: {
      parent: Prisma.$CategoryPayload<ExtArgs> | null
      children: Prisma.$CategoryPayload<ExtArgs>[]
      products: Prisma.$ProductPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      parentId: string | null
      order: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["category"]>
    composites: {}
  }

  type CategoryGetPayload<S extends boolean | null | undefined | CategoryDefaultArgs> = $Result.GetResult<Prisma.$CategoryPayload, S>

  type CategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CategoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CategoryCountAggregateInputType | true
    }

  export interface CategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Category'], meta: { name: 'Category' } }
    /**
     * Find zero or one Category that matches the filter.
     * @param {CategoryFindUniqueArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CategoryFindUniqueArgs>(args: SelectSubset<T, CategoryFindUniqueArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Category that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CategoryFindUniqueOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, CategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Category that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindFirstArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CategoryFindFirstArgs>(args?: SelectSubset<T, CategoryFindFirstArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Category that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindFirstOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, CategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Categories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Categories
     * const categories = await prisma.category.findMany()
     * 
     * // Get first 10 Categories
     * const categories = await prisma.category.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const categoryWithIdOnly = await prisma.category.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CategoryFindManyArgs>(args?: SelectSubset<T, CategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Category.
     * @param {CategoryCreateArgs} args - Arguments to create a Category.
     * @example
     * // Create one Category
     * const Category = await prisma.category.create({
     *   data: {
     *     // ... data to create a Category
     *   }
     * })
     * 
     */
    create<T extends CategoryCreateArgs>(args: SelectSubset<T, CategoryCreateArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Categories.
     * @param {CategoryCreateManyArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const category = await prisma.category.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CategoryCreateManyArgs>(args?: SelectSubset<T, CategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Categories and returns the data saved in the database.
     * @param {CategoryCreateManyAndReturnArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const category = await prisma.category.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Categories and only return the `id`
     * const categoryWithIdOnly = await prisma.category.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, CategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Category.
     * @param {CategoryDeleteArgs} args - Arguments to delete one Category.
     * @example
     * // Delete one Category
     * const Category = await prisma.category.delete({
     *   where: {
     *     // ... filter to delete one Category
     *   }
     * })
     * 
     */
    delete<T extends CategoryDeleteArgs>(args: SelectSubset<T, CategoryDeleteArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Category.
     * @param {CategoryUpdateArgs} args - Arguments to update one Category.
     * @example
     * // Update one Category
     * const category = await prisma.category.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CategoryUpdateArgs>(args: SelectSubset<T, CategoryUpdateArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Categories.
     * @param {CategoryDeleteManyArgs} args - Arguments to filter Categories to delete.
     * @example
     * // Delete a few Categories
     * const { count } = await prisma.category.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CategoryDeleteManyArgs>(args?: SelectSubset<T, CategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Categories
     * const category = await prisma.category.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CategoryUpdateManyArgs>(args: SelectSubset<T, CategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Category.
     * @param {CategoryUpsertArgs} args - Arguments to update or create a Category.
     * @example
     * // Update or create a Category
     * const category = await prisma.category.upsert({
     *   create: {
     *     // ... data to create a Category
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Category we want to update
     *   }
     * })
     */
    upsert<T extends CategoryUpsertArgs>(args: SelectSubset<T, CategoryUpsertArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryCountArgs} args - Arguments to filter Categories to count.
     * @example
     * // Count the number of Categories
     * const count = await prisma.category.count({
     *   where: {
     *     // ... the filter for the Categories we want to count
     *   }
     * })
    **/
    count<T extends CategoryCountArgs>(
      args?: Subset<T, CategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CategoryAggregateArgs>(args: Subset<T, CategoryAggregateArgs>): Prisma.PrismaPromise<GetCategoryAggregateType<T>>

    /**
     * Group by Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CategoryGroupByArgs['orderBy'] }
        : { orderBy?: CategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Category model
   */
  readonly fields: CategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Category.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    parent<T extends Category$parentArgs<ExtArgs> = {}>(args?: Subset<T, Category$parentArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    children<T extends Category$childrenArgs<ExtArgs> = {}>(args?: Subset<T, Category$childrenArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findMany"> | Null>
    products<T extends Category$productsArgs<ExtArgs> = {}>(args?: Subset<T, Category$productsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Category model
   */ 
  interface CategoryFieldRefs {
    readonly id: FieldRef<"Category", 'String'>
    readonly name: FieldRef<"Category", 'String'>
    readonly slug: FieldRef<"Category", 'String'>
    readonly parentId: FieldRef<"Category", 'String'>
    readonly order: FieldRef<"Category", 'Int'>
    readonly createdAt: FieldRef<"Category", 'DateTime'>
    readonly updatedAt: FieldRef<"Category", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Category findUnique
   */
  export type CategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category findUniqueOrThrow
   */
  export type CategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category findFirst
   */
  export type CategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category findFirstOrThrow
   */
  export type CategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category findMany
   */
  export type CategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Categories to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category create
   */
  export type CategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a Category.
     */
    data: XOR<CategoryCreateInput, CategoryUncheckedCreateInput>
  }

  /**
   * Category createMany
   */
  export type CategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Categories.
     */
    data: CategoryCreateManyInput | CategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Category createManyAndReturn
   */
  export type CategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Categories.
     */
    data: CategoryCreateManyInput | CategoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Category update
   */
  export type CategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a Category.
     */
    data: XOR<CategoryUpdateInput, CategoryUncheckedUpdateInput>
    /**
     * Choose, which Category to update.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category updateMany
   */
  export type CategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Categories.
     */
    data: XOR<CategoryUpdateManyMutationInput, CategoryUncheckedUpdateManyInput>
    /**
     * Filter which Categories to update
     */
    where?: CategoryWhereInput
  }

  /**
   * Category upsert
   */
  export type CategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the Category to update in case it exists.
     */
    where: CategoryWhereUniqueInput
    /**
     * In case the Category found by the `where` argument doesn't exist, create a new Category with this data.
     */
    create: XOR<CategoryCreateInput, CategoryUncheckedCreateInput>
    /**
     * In case the Category was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CategoryUpdateInput, CategoryUncheckedUpdateInput>
  }

  /**
   * Category delete
   */
  export type CategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter which Category to delete.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category deleteMany
   */
  export type CategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Categories to delete
     */
    where?: CategoryWhereInput
  }

  /**
   * Category.parent
   */
  export type Category$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    where?: CategoryWhereInput
  }

  /**
   * Category.children
   */
  export type Category$childrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    where?: CategoryWhereInput
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    cursor?: CategoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category.products
   */
  export type Category$productsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    cursor?: ProductWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Category without action
   */
  export type CategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
  }


  /**
   * Model Brand
   */

  export type AggregateBrand = {
    _count: BrandCountAggregateOutputType | null
    _min: BrandMinAggregateOutputType | null
    _max: BrandMaxAggregateOutputType | null
  }

  export type BrandMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BrandMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BrandCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BrandMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BrandMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BrandCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BrandAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Brand to aggregate.
     */
    where?: BrandWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Brands to fetch.
     */
    orderBy?: BrandOrderByWithRelationInput | BrandOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BrandWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Brands from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Brands.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Brands
    **/
    _count?: true | BrandCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BrandMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BrandMaxAggregateInputType
  }

  export type GetBrandAggregateType<T extends BrandAggregateArgs> = {
        [P in keyof T & keyof AggregateBrand]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBrand[P]>
      : GetScalarType<T[P], AggregateBrand[P]>
  }




  export type BrandGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BrandWhereInput
    orderBy?: BrandOrderByWithAggregationInput | BrandOrderByWithAggregationInput[]
    by: BrandScalarFieldEnum[] | BrandScalarFieldEnum
    having?: BrandScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BrandCountAggregateInputType | true
    _min?: BrandMinAggregateInputType
    _max?: BrandMaxAggregateInputType
  }

  export type BrandGroupByOutputType = {
    id: string
    name: string
    slug: string
    createdAt: Date
    updatedAt: Date
    _count: BrandCountAggregateOutputType | null
    _min: BrandMinAggregateOutputType | null
    _max: BrandMaxAggregateOutputType | null
  }

  type GetBrandGroupByPayload<T extends BrandGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BrandGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BrandGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BrandGroupByOutputType[P]>
            : GetScalarType<T[P], BrandGroupByOutputType[P]>
        }
      >
    >


  export type BrandSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    products?: boolean | Brand$productsArgs<ExtArgs>
    _count?: boolean | BrandCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["brand"]>

  export type BrandSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["brand"]>

  export type BrandSelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BrandInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    products?: boolean | Brand$productsArgs<ExtArgs>
    _count?: boolean | BrandCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BrandIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $BrandPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Brand"
    objects: {
      products: Prisma.$ProductPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["brand"]>
    composites: {}
  }

  type BrandGetPayload<S extends boolean | null | undefined | BrandDefaultArgs> = $Result.GetResult<Prisma.$BrandPayload, S>

  type BrandCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<BrandFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: BrandCountAggregateInputType | true
    }

  export interface BrandDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Brand'], meta: { name: 'Brand' } }
    /**
     * Find zero or one Brand that matches the filter.
     * @param {BrandFindUniqueArgs} args - Arguments to find a Brand
     * @example
     * // Get one Brand
     * const brand = await prisma.brand.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BrandFindUniqueArgs>(args: SelectSubset<T, BrandFindUniqueArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Brand that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {BrandFindUniqueOrThrowArgs} args - Arguments to find a Brand
     * @example
     * // Get one Brand
     * const brand = await prisma.brand.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BrandFindUniqueOrThrowArgs>(args: SelectSubset<T, BrandFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Brand that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandFindFirstArgs} args - Arguments to find a Brand
     * @example
     * // Get one Brand
     * const brand = await prisma.brand.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BrandFindFirstArgs>(args?: SelectSubset<T, BrandFindFirstArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Brand that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandFindFirstOrThrowArgs} args - Arguments to find a Brand
     * @example
     * // Get one Brand
     * const brand = await prisma.brand.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BrandFindFirstOrThrowArgs>(args?: SelectSubset<T, BrandFindFirstOrThrowArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Brands that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Brands
     * const brands = await prisma.brand.findMany()
     * 
     * // Get first 10 Brands
     * const brands = await prisma.brand.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const brandWithIdOnly = await prisma.brand.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BrandFindManyArgs>(args?: SelectSubset<T, BrandFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Brand.
     * @param {BrandCreateArgs} args - Arguments to create a Brand.
     * @example
     * // Create one Brand
     * const Brand = await prisma.brand.create({
     *   data: {
     *     // ... data to create a Brand
     *   }
     * })
     * 
     */
    create<T extends BrandCreateArgs>(args: SelectSubset<T, BrandCreateArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Brands.
     * @param {BrandCreateManyArgs} args - Arguments to create many Brands.
     * @example
     * // Create many Brands
     * const brand = await prisma.brand.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BrandCreateManyArgs>(args?: SelectSubset<T, BrandCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Brands and returns the data saved in the database.
     * @param {BrandCreateManyAndReturnArgs} args - Arguments to create many Brands.
     * @example
     * // Create many Brands
     * const brand = await prisma.brand.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Brands and only return the `id`
     * const brandWithIdOnly = await prisma.brand.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BrandCreateManyAndReturnArgs>(args?: SelectSubset<T, BrandCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Brand.
     * @param {BrandDeleteArgs} args - Arguments to delete one Brand.
     * @example
     * // Delete one Brand
     * const Brand = await prisma.brand.delete({
     *   where: {
     *     // ... filter to delete one Brand
     *   }
     * })
     * 
     */
    delete<T extends BrandDeleteArgs>(args: SelectSubset<T, BrandDeleteArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Brand.
     * @param {BrandUpdateArgs} args - Arguments to update one Brand.
     * @example
     * // Update one Brand
     * const brand = await prisma.brand.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BrandUpdateArgs>(args: SelectSubset<T, BrandUpdateArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Brands.
     * @param {BrandDeleteManyArgs} args - Arguments to filter Brands to delete.
     * @example
     * // Delete a few Brands
     * const { count } = await prisma.brand.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BrandDeleteManyArgs>(args?: SelectSubset<T, BrandDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Brands.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Brands
     * const brand = await prisma.brand.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BrandUpdateManyArgs>(args: SelectSubset<T, BrandUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Brand.
     * @param {BrandUpsertArgs} args - Arguments to update or create a Brand.
     * @example
     * // Update or create a Brand
     * const brand = await prisma.brand.upsert({
     *   create: {
     *     // ... data to create a Brand
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Brand we want to update
     *   }
     * })
     */
    upsert<T extends BrandUpsertArgs>(args: SelectSubset<T, BrandUpsertArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Brands.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandCountArgs} args - Arguments to filter Brands to count.
     * @example
     * // Count the number of Brands
     * const count = await prisma.brand.count({
     *   where: {
     *     // ... the filter for the Brands we want to count
     *   }
     * })
    **/
    count<T extends BrandCountArgs>(
      args?: Subset<T, BrandCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BrandCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Brand.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BrandAggregateArgs>(args: Subset<T, BrandAggregateArgs>): Prisma.PrismaPromise<GetBrandAggregateType<T>>

    /**
     * Group by Brand.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BrandGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BrandGroupByArgs['orderBy'] }
        : { orderBy?: BrandGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BrandGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBrandGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Brand model
   */
  readonly fields: BrandFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Brand.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BrandClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    products<T extends Brand$productsArgs<ExtArgs> = {}>(args?: Subset<T, Brand$productsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Brand model
   */ 
  interface BrandFieldRefs {
    readonly id: FieldRef<"Brand", 'String'>
    readonly name: FieldRef<"Brand", 'String'>
    readonly slug: FieldRef<"Brand", 'String'>
    readonly createdAt: FieldRef<"Brand", 'DateTime'>
    readonly updatedAt: FieldRef<"Brand", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Brand findUnique
   */
  export type BrandFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * Filter, which Brand to fetch.
     */
    where: BrandWhereUniqueInput
  }

  /**
   * Brand findUniqueOrThrow
   */
  export type BrandFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * Filter, which Brand to fetch.
     */
    where: BrandWhereUniqueInput
  }

  /**
   * Brand findFirst
   */
  export type BrandFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * Filter, which Brand to fetch.
     */
    where?: BrandWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Brands to fetch.
     */
    orderBy?: BrandOrderByWithRelationInput | BrandOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Brands.
     */
    cursor?: BrandWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Brands from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Brands.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Brands.
     */
    distinct?: BrandScalarFieldEnum | BrandScalarFieldEnum[]
  }

  /**
   * Brand findFirstOrThrow
   */
  export type BrandFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * Filter, which Brand to fetch.
     */
    where?: BrandWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Brands to fetch.
     */
    orderBy?: BrandOrderByWithRelationInput | BrandOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Brands.
     */
    cursor?: BrandWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Brands from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Brands.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Brands.
     */
    distinct?: BrandScalarFieldEnum | BrandScalarFieldEnum[]
  }

  /**
   * Brand findMany
   */
  export type BrandFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * Filter, which Brands to fetch.
     */
    where?: BrandWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Brands to fetch.
     */
    orderBy?: BrandOrderByWithRelationInput | BrandOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Brands.
     */
    cursor?: BrandWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Brands from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Brands.
     */
    skip?: number
    distinct?: BrandScalarFieldEnum | BrandScalarFieldEnum[]
  }

  /**
   * Brand create
   */
  export type BrandCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * The data needed to create a Brand.
     */
    data: XOR<BrandCreateInput, BrandUncheckedCreateInput>
  }

  /**
   * Brand createMany
   */
  export type BrandCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Brands.
     */
    data: BrandCreateManyInput | BrandCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Brand createManyAndReturn
   */
  export type BrandCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Brands.
     */
    data: BrandCreateManyInput | BrandCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Brand update
   */
  export type BrandUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * The data needed to update a Brand.
     */
    data: XOR<BrandUpdateInput, BrandUncheckedUpdateInput>
    /**
     * Choose, which Brand to update.
     */
    where: BrandWhereUniqueInput
  }

  /**
   * Brand updateMany
   */
  export type BrandUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Brands.
     */
    data: XOR<BrandUpdateManyMutationInput, BrandUncheckedUpdateManyInput>
    /**
     * Filter which Brands to update
     */
    where?: BrandWhereInput
  }

  /**
   * Brand upsert
   */
  export type BrandUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * The filter to search for the Brand to update in case it exists.
     */
    where: BrandWhereUniqueInput
    /**
     * In case the Brand found by the `where` argument doesn't exist, create a new Brand with this data.
     */
    create: XOR<BrandCreateInput, BrandUncheckedCreateInput>
    /**
     * In case the Brand was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BrandUpdateInput, BrandUncheckedUpdateInput>
  }

  /**
   * Brand delete
   */
  export type BrandDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * Filter which Brand to delete.
     */
    where: BrandWhereUniqueInput
  }

  /**
   * Brand deleteMany
   */
  export type BrandDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Brands to delete
     */
    where?: BrandWhereInput
  }

  /**
   * Brand.products
   */
  export type Brand$productsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    cursor?: ProductWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Brand without action
   */
  export type BrandDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
  }


  /**
   * Model Product
   */

  export type AggregateProduct = {
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  export type ProductAvgAggregateOutputType = {
    basePrice: number | null
  }

  export type ProductSumAggregateOutputType = {
    basePrice: number | null
  }

  export type ProductMinAggregateOutputType = {
    id: string | null
    sku: string | null
    slug: string | null
    name: string | null
    description: string | null
    brandId: string | null
    categoryId: string | null
    basePrice: number | null
    currency: string | null
    status: $Enums.ProductStatus | null
    createdAt: Date | null
    updatedAt: Date | null
    publishedAt: Date | null
  }

  export type ProductMaxAggregateOutputType = {
    id: string | null
    sku: string | null
    slug: string | null
    name: string | null
    description: string | null
    brandId: string | null
    categoryId: string | null
    basePrice: number | null
    currency: string | null
    status: $Enums.ProductStatus | null
    createdAt: Date | null
    updatedAt: Date | null
    publishedAt: Date | null
  }

  export type ProductCountAggregateOutputType = {
    id: number
    sku: number
    slug: number
    name: number
    description: number
    brandId: number
    categoryId: number
    basePrice: number
    currency: number
    status: number
    attributes: number
    createdAt: number
    updatedAt: number
    publishedAt: number
    _all: number
  }


  export type ProductAvgAggregateInputType = {
    basePrice?: true
  }

  export type ProductSumAggregateInputType = {
    basePrice?: true
  }

  export type ProductMinAggregateInputType = {
    id?: true
    sku?: true
    slug?: true
    name?: true
    description?: true
    brandId?: true
    categoryId?: true
    basePrice?: true
    currency?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
  }

  export type ProductMaxAggregateInputType = {
    id?: true
    sku?: true
    slug?: true
    name?: true
    description?: true
    brandId?: true
    categoryId?: true
    basePrice?: true
    currency?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
  }

  export type ProductCountAggregateInputType = {
    id?: true
    sku?: true
    slug?: true
    name?: true
    description?: true
    brandId?: true
    categoryId?: true
    basePrice?: true
    currency?: true
    status?: true
    attributes?: true
    createdAt?: true
    updatedAt?: true
    publishedAt?: true
    _all?: true
  }

  export type ProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Product to aggregate.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Products
    **/
    _count?: true | ProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductMaxAggregateInputType
  }

  export type GetProductAggregateType<T extends ProductAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct[P]>
      : GetScalarType<T[P], AggregateProduct[P]>
  }




  export type ProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithAggregationInput | ProductOrderByWithAggregationInput[]
    by: ProductScalarFieldEnum[] | ProductScalarFieldEnum
    having?: ProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductCountAggregateInputType | true
    _avg?: ProductAvgAggregateInputType
    _sum?: ProductSumAggregateInputType
    _min?: ProductMinAggregateInputType
    _max?: ProductMaxAggregateInputType
  }

  export type ProductGroupByOutputType = {
    id: string
    sku: string
    slug: string
    name: string
    description: string
    brandId: string
    categoryId: string
    basePrice: number
    currency: string
    status: $Enums.ProductStatus
    attributes: JsonValue
    createdAt: Date
    updatedAt: Date
    publishedAt: Date | null
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  type GetProductGroupByPayload<T extends ProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductGroupByOutputType[P]>
            : GetScalarType<T[P], ProductGroupByOutputType[P]>
        }
      >
    >


  export type ProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sku?: boolean
    slug?: boolean
    name?: boolean
    description?: boolean
    brandId?: boolean
    categoryId?: boolean
    basePrice?: boolean
    currency?: boolean
    status?: boolean
    attributes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
    brand?: boolean | BrandDefaultArgs<ExtArgs>
    category?: boolean | CategoryDefaultArgs<ExtArgs>
    variants?: boolean | Product$variantsArgs<ExtArgs>
    media?: boolean | Product$mediaArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sku?: boolean
    slug?: boolean
    name?: boolean
    description?: boolean
    brandId?: boolean
    categoryId?: boolean
    basePrice?: boolean
    currency?: boolean
    status?: boolean
    attributes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
    brand?: boolean | BrandDefaultArgs<ExtArgs>
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectScalar = {
    id?: boolean
    sku?: boolean
    slug?: boolean
    name?: boolean
    description?: boolean
    brandId?: boolean
    categoryId?: boolean
    basePrice?: boolean
    currency?: boolean
    status?: boolean
    attributes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    publishedAt?: boolean
  }

  export type ProductInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brand?: boolean | BrandDefaultArgs<ExtArgs>
    category?: boolean | CategoryDefaultArgs<ExtArgs>
    variants?: boolean | Product$variantsArgs<ExtArgs>
    media?: boolean | Product$mediaArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProductIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brand?: boolean | BrandDefaultArgs<ExtArgs>
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }

  export type $ProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Product"
    objects: {
      brand: Prisma.$BrandPayload<ExtArgs>
      category: Prisma.$CategoryPayload<ExtArgs>
      variants: Prisma.$VariantPayload<ExtArgs>[]
      media: Prisma.$ProductMediaPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sku: string
      slug: string
      name: string
      description: string
      brandId: string
      categoryId: string
      basePrice: number
      currency: string
      status: $Enums.ProductStatus
      attributes: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
      publishedAt: Date | null
    }, ExtArgs["result"]["product"]>
    composites: {}
  }

  type ProductGetPayload<S extends boolean | null | undefined | ProductDefaultArgs> = $Result.GetResult<Prisma.$ProductPayload, S>

  type ProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProductFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProductCountAggregateInputType | true
    }

  export interface ProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Product'], meta: { name: 'Product' } }
    /**
     * Find zero or one Product that matches the filter.
     * @param {ProductFindUniqueArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductFindUniqueArgs>(args: SelectSubset<T, ProductFindUniqueArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Product that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProductFindUniqueOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Product that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductFindFirstArgs>(args?: SelectSubset<T, ProductFindFirstArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Product that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Products
     * const products = await prisma.product.findMany()
     * 
     * // Get first 10 Products
     * const products = await prisma.product.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productWithIdOnly = await prisma.product.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProductFindManyArgs>(args?: SelectSubset<T, ProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Product.
     * @param {ProductCreateArgs} args - Arguments to create a Product.
     * @example
     * // Create one Product
     * const Product = await prisma.product.create({
     *   data: {
     *     // ... data to create a Product
     *   }
     * })
     * 
     */
    create<T extends ProductCreateArgs>(args: SelectSubset<T, ProductCreateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Products.
     * @param {ProductCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductCreateManyArgs>(args?: SelectSubset<T, ProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Products and returns the data saved in the database.
     * @param {ProductCreateManyAndReturnArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Products and only return the `id`
     * const productWithIdOnly = await prisma.product.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Product.
     * @param {ProductDeleteArgs} args - Arguments to delete one Product.
     * @example
     * // Delete one Product
     * const Product = await prisma.product.delete({
     *   where: {
     *     // ... filter to delete one Product
     *   }
     * })
     * 
     */
    delete<T extends ProductDeleteArgs>(args: SelectSubset<T, ProductDeleteArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Product.
     * @param {ProductUpdateArgs} args - Arguments to update one Product.
     * @example
     * // Update one Product
     * const product = await prisma.product.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductUpdateArgs>(args: SelectSubset<T, ProductUpdateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Products.
     * @param {ProductDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.product.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductDeleteManyArgs>(args?: SelectSubset<T, ProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductUpdateManyArgs>(args: SelectSubset<T, ProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Product.
     * @param {ProductUpsertArgs} args - Arguments to update or create a Product.
     * @example
     * // Update or create a Product
     * const product = await prisma.product.upsert({
     *   create: {
     *     // ... data to create a Product
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product we want to update
     *   }
     * })
     */
    upsert<T extends ProductUpsertArgs>(args: SelectSubset<T, ProductUpsertArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.product.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends ProductCountArgs>(
      args?: Subset<T, ProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProductAggregateArgs>(args: Subset<T, ProductAggregateArgs>): Prisma.PrismaPromise<GetProductAggregateType<T>>

    /**
     * Group by Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductGroupByArgs['orderBy'] }
        : { orderBy?: ProductGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Product model
   */
  readonly fields: ProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Product.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    brand<T extends BrandDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BrandDefaultArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    category<T extends CategoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CategoryDefaultArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    variants<T extends Product$variantsArgs<ExtArgs> = {}>(args?: Subset<T, Product$variantsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "findMany"> | Null>
    media<T extends Product$mediaArgs<ExtArgs> = {}>(args?: Subset<T, Product$mediaArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductMediaPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Product model
   */ 
  interface ProductFieldRefs {
    readonly id: FieldRef<"Product", 'String'>
    readonly sku: FieldRef<"Product", 'String'>
    readonly slug: FieldRef<"Product", 'String'>
    readonly name: FieldRef<"Product", 'String'>
    readonly description: FieldRef<"Product", 'String'>
    readonly brandId: FieldRef<"Product", 'String'>
    readonly categoryId: FieldRef<"Product", 'String'>
    readonly basePrice: FieldRef<"Product", 'Int'>
    readonly currency: FieldRef<"Product", 'String'>
    readonly status: FieldRef<"Product", 'ProductStatus'>
    readonly attributes: FieldRef<"Product", 'Json'>
    readonly createdAt: FieldRef<"Product", 'DateTime'>
    readonly updatedAt: FieldRef<"Product", 'DateTime'>
    readonly publishedAt: FieldRef<"Product", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Product findUnique
   */
  export type ProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findUniqueOrThrow
   */
  export type ProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findFirst
   */
  export type ProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findFirstOrThrow
   */
  export type ProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findMany
   */
  export type ProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Products to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product create
   */
  export type ProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to create a Product.
     */
    data: XOR<ProductCreateInput, ProductUncheckedCreateInput>
  }

  /**
   * Product createMany
   */
  export type ProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Product createManyAndReturn
   */
  export type ProductCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Product update
   */
  export type ProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to update a Product.
     */
    data: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
    /**
     * Choose, which Product to update.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product updateMany
   */
  export type ProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
  }

  /**
   * Product upsert
   */
  export type ProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The filter to search for the Product to update in case it exists.
     */
    where: ProductWhereUniqueInput
    /**
     * In case the Product found by the `where` argument doesn't exist, create a new Product with this data.
     */
    create: XOR<ProductCreateInput, ProductUncheckedCreateInput>
    /**
     * In case the Product was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
  }

  /**
   * Product delete
   */
  export type ProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter which Product to delete.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product deleteMany
   */
  export type ProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Products to delete
     */
    where?: ProductWhereInput
  }

  /**
   * Product.variants
   */
  export type Product$variantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    where?: VariantWhereInput
    orderBy?: VariantOrderByWithRelationInput | VariantOrderByWithRelationInput[]
    cursor?: VariantWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VariantScalarFieldEnum | VariantScalarFieldEnum[]
  }

  /**
   * Product.media
   */
  export type Product$mediaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMedia
     */
    select?: ProductMediaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMediaInclude<ExtArgs> | null
    where?: ProductMediaWhereInput
    orderBy?: ProductMediaOrderByWithRelationInput | ProductMediaOrderByWithRelationInput[]
    cursor?: ProductMediaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductMediaScalarFieldEnum | ProductMediaScalarFieldEnum[]
  }

  /**
   * Product without action
   */
  export type ProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
  }


  /**
   * Model Variant
   */

  export type AggregateVariant = {
    _count: VariantCountAggregateOutputType | null
    _avg: VariantAvgAggregateOutputType | null
    _sum: VariantSumAggregateOutputType | null
    _min: VariantMinAggregateOutputType | null
    _max: VariantMaxAggregateOutputType | null
  }

  export type VariantAvgAggregateOutputType = {
    price: number | null
  }

  export type VariantSumAggregateOutputType = {
    price: number | null
  }

  export type VariantMinAggregateOutputType = {
    id: string | null
    productId: string | null
    sku: string | null
    name: string | null
    price: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VariantMaxAggregateOutputType = {
    id: string | null
    productId: string | null
    sku: string | null
    name: string | null
    price: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VariantCountAggregateOutputType = {
    id: number
    productId: number
    sku: number
    name: number
    price: number
    attributes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type VariantAvgAggregateInputType = {
    price?: true
  }

  export type VariantSumAggregateInputType = {
    price?: true
  }

  export type VariantMinAggregateInputType = {
    id?: true
    productId?: true
    sku?: true
    name?: true
    price?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VariantMaxAggregateInputType = {
    id?: true
    productId?: true
    sku?: true
    name?: true
    price?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VariantCountAggregateInputType = {
    id?: true
    productId?: true
    sku?: true
    name?: true
    price?: true
    attributes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type VariantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Variant to aggregate.
     */
    where?: VariantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Variants to fetch.
     */
    orderBy?: VariantOrderByWithRelationInput | VariantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VariantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Variants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Variants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Variants
    **/
    _count?: true | VariantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VariantAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VariantSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VariantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VariantMaxAggregateInputType
  }

  export type GetVariantAggregateType<T extends VariantAggregateArgs> = {
        [P in keyof T & keyof AggregateVariant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVariant[P]>
      : GetScalarType<T[P], AggregateVariant[P]>
  }




  export type VariantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VariantWhereInput
    orderBy?: VariantOrderByWithAggregationInput | VariantOrderByWithAggregationInput[]
    by: VariantScalarFieldEnum[] | VariantScalarFieldEnum
    having?: VariantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VariantCountAggregateInputType | true
    _avg?: VariantAvgAggregateInputType
    _sum?: VariantSumAggregateInputType
    _min?: VariantMinAggregateInputType
    _max?: VariantMaxAggregateInputType
  }

  export type VariantGroupByOutputType = {
    id: string
    productId: string
    sku: string
    name: string
    price: number | null
    attributes: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: VariantCountAggregateOutputType | null
    _avg: VariantAvgAggregateOutputType | null
    _sum: VariantSumAggregateOutputType | null
    _min: VariantMinAggregateOutputType | null
    _max: VariantMaxAggregateOutputType | null
  }

  type GetVariantGroupByPayload<T extends VariantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VariantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VariantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VariantGroupByOutputType[P]>
            : GetScalarType<T[P], VariantGroupByOutputType[P]>
        }
      >
    >


  export type VariantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    sku?: boolean
    name?: boolean
    price?: boolean
    attributes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["variant"]>

  export type VariantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    sku?: boolean
    name?: boolean
    price?: boolean
    attributes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["variant"]>

  export type VariantSelectScalar = {
    id?: boolean
    productId?: boolean
    sku?: boolean
    name?: boolean
    price?: boolean
    attributes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type VariantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type VariantIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }

  export type $VariantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Variant"
    objects: {
      product: Prisma.$ProductPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      productId: string
      sku: string
      name: string
      price: number | null
      attributes: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["variant"]>
    composites: {}
  }

  type VariantGetPayload<S extends boolean | null | undefined | VariantDefaultArgs> = $Result.GetResult<Prisma.$VariantPayload, S>

  type VariantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<VariantFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: VariantCountAggregateInputType | true
    }

  export interface VariantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Variant'], meta: { name: 'Variant' } }
    /**
     * Find zero or one Variant that matches the filter.
     * @param {VariantFindUniqueArgs} args - Arguments to find a Variant
     * @example
     * // Get one Variant
     * const variant = await prisma.variant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VariantFindUniqueArgs>(args: SelectSubset<T, VariantFindUniqueArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Variant that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {VariantFindUniqueOrThrowArgs} args - Arguments to find a Variant
     * @example
     * // Get one Variant
     * const variant = await prisma.variant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VariantFindUniqueOrThrowArgs>(args: SelectSubset<T, VariantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Variant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VariantFindFirstArgs} args - Arguments to find a Variant
     * @example
     * // Get one Variant
     * const variant = await prisma.variant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VariantFindFirstArgs>(args?: SelectSubset<T, VariantFindFirstArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Variant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VariantFindFirstOrThrowArgs} args - Arguments to find a Variant
     * @example
     * // Get one Variant
     * const variant = await prisma.variant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VariantFindFirstOrThrowArgs>(args?: SelectSubset<T, VariantFindFirstOrThrowArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Variants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VariantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Variants
     * const variants = await prisma.variant.findMany()
     * 
     * // Get first 10 Variants
     * const variants = await prisma.variant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const variantWithIdOnly = await prisma.variant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VariantFindManyArgs>(args?: SelectSubset<T, VariantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Variant.
     * @param {VariantCreateArgs} args - Arguments to create a Variant.
     * @example
     * // Create one Variant
     * const Variant = await prisma.variant.create({
     *   data: {
     *     // ... data to create a Variant
     *   }
     * })
     * 
     */
    create<T extends VariantCreateArgs>(args: SelectSubset<T, VariantCreateArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Variants.
     * @param {VariantCreateManyArgs} args - Arguments to create many Variants.
     * @example
     * // Create many Variants
     * const variant = await prisma.variant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VariantCreateManyArgs>(args?: SelectSubset<T, VariantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Variants and returns the data saved in the database.
     * @param {VariantCreateManyAndReturnArgs} args - Arguments to create many Variants.
     * @example
     * // Create many Variants
     * const variant = await prisma.variant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Variants and only return the `id`
     * const variantWithIdOnly = await prisma.variant.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VariantCreateManyAndReturnArgs>(args?: SelectSubset<T, VariantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Variant.
     * @param {VariantDeleteArgs} args - Arguments to delete one Variant.
     * @example
     * // Delete one Variant
     * const Variant = await prisma.variant.delete({
     *   where: {
     *     // ... filter to delete one Variant
     *   }
     * })
     * 
     */
    delete<T extends VariantDeleteArgs>(args: SelectSubset<T, VariantDeleteArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Variant.
     * @param {VariantUpdateArgs} args - Arguments to update one Variant.
     * @example
     * // Update one Variant
     * const variant = await prisma.variant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VariantUpdateArgs>(args: SelectSubset<T, VariantUpdateArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Variants.
     * @param {VariantDeleteManyArgs} args - Arguments to filter Variants to delete.
     * @example
     * // Delete a few Variants
     * const { count } = await prisma.variant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VariantDeleteManyArgs>(args?: SelectSubset<T, VariantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Variants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VariantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Variants
     * const variant = await prisma.variant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VariantUpdateManyArgs>(args: SelectSubset<T, VariantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Variant.
     * @param {VariantUpsertArgs} args - Arguments to update or create a Variant.
     * @example
     * // Update or create a Variant
     * const variant = await prisma.variant.upsert({
     *   create: {
     *     // ... data to create a Variant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Variant we want to update
     *   }
     * })
     */
    upsert<T extends VariantUpsertArgs>(args: SelectSubset<T, VariantUpsertArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Variants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VariantCountArgs} args - Arguments to filter Variants to count.
     * @example
     * // Count the number of Variants
     * const count = await prisma.variant.count({
     *   where: {
     *     // ... the filter for the Variants we want to count
     *   }
     * })
    **/
    count<T extends VariantCountArgs>(
      args?: Subset<T, VariantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VariantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Variant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VariantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VariantAggregateArgs>(args: Subset<T, VariantAggregateArgs>): Prisma.PrismaPromise<GetVariantAggregateType<T>>

    /**
     * Group by Variant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VariantGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VariantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VariantGroupByArgs['orderBy'] }
        : { orderBy?: VariantGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VariantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVariantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Variant model
   */
  readonly fields: VariantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Variant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VariantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    product<T extends ProductDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductDefaultArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Variant model
   */ 
  interface VariantFieldRefs {
    readonly id: FieldRef<"Variant", 'String'>
    readonly productId: FieldRef<"Variant", 'String'>
    readonly sku: FieldRef<"Variant", 'String'>
    readonly name: FieldRef<"Variant", 'String'>
    readonly price: FieldRef<"Variant", 'Int'>
    readonly attributes: FieldRef<"Variant", 'Json'>
    readonly createdAt: FieldRef<"Variant", 'DateTime'>
    readonly updatedAt: FieldRef<"Variant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Variant findUnique
   */
  export type VariantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * Filter, which Variant to fetch.
     */
    where: VariantWhereUniqueInput
  }

  /**
   * Variant findUniqueOrThrow
   */
  export type VariantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * Filter, which Variant to fetch.
     */
    where: VariantWhereUniqueInput
  }

  /**
   * Variant findFirst
   */
  export type VariantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * Filter, which Variant to fetch.
     */
    where?: VariantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Variants to fetch.
     */
    orderBy?: VariantOrderByWithRelationInput | VariantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Variants.
     */
    cursor?: VariantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Variants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Variants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Variants.
     */
    distinct?: VariantScalarFieldEnum | VariantScalarFieldEnum[]
  }

  /**
   * Variant findFirstOrThrow
   */
  export type VariantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * Filter, which Variant to fetch.
     */
    where?: VariantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Variants to fetch.
     */
    orderBy?: VariantOrderByWithRelationInput | VariantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Variants.
     */
    cursor?: VariantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Variants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Variants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Variants.
     */
    distinct?: VariantScalarFieldEnum | VariantScalarFieldEnum[]
  }

  /**
   * Variant findMany
   */
  export type VariantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * Filter, which Variants to fetch.
     */
    where?: VariantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Variants to fetch.
     */
    orderBy?: VariantOrderByWithRelationInput | VariantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Variants.
     */
    cursor?: VariantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Variants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Variants.
     */
    skip?: number
    distinct?: VariantScalarFieldEnum | VariantScalarFieldEnum[]
  }

  /**
   * Variant create
   */
  export type VariantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * The data needed to create a Variant.
     */
    data: XOR<VariantCreateInput, VariantUncheckedCreateInput>
  }

  /**
   * Variant createMany
   */
  export type VariantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Variants.
     */
    data: VariantCreateManyInput | VariantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Variant createManyAndReturn
   */
  export type VariantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Variants.
     */
    data: VariantCreateManyInput | VariantCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Variant update
   */
  export type VariantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * The data needed to update a Variant.
     */
    data: XOR<VariantUpdateInput, VariantUncheckedUpdateInput>
    /**
     * Choose, which Variant to update.
     */
    where: VariantWhereUniqueInput
  }

  /**
   * Variant updateMany
   */
  export type VariantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Variants.
     */
    data: XOR<VariantUpdateManyMutationInput, VariantUncheckedUpdateManyInput>
    /**
     * Filter which Variants to update
     */
    where?: VariantWhereInput
  }

  /**
   * Variant upsert
   */
  export type VariantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * The filter to search for the Variant to update in case it exists.
     */
    where: VariantWhereUniqueInput
    /**
     * In case the Variant found by the `where` argument doesn't exist, create a new Variant with this data.
     */
    create: XOR<VariantCreateInput, VariantUncheckedCreateInput>
    /**
     * In case the Variant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VariantUpdateInput, VariantUncheckedUpdateInput>
  }

  /**
   * Variant delete
   */
  export type VariantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * Filter which Variant to delete.
     */
    where: VariantWhereUniqueInput
  }

  /**
   * Variant deleteMany
   */
  export type VariantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Variants to delete
     */
    where?: VariantWhereInput
  }

  /**
   * Variant without action
   */
  export type VariantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
  }


  /**
   * Model ProductMedia
   */

  export type AggregateProductMedia = {
    _count: ProductMediaCountAggregateOutputType | null
    _avg: ProductMediaAvgAggregateOutputType | null
    _sum: ProductMediaSumAggregateOutputType | null
    _min: ProductMediaMinAggregateOutputType | null
    _max: ProductMediaMaxAggregateOutputType | null
  }

  export type ProductMediaAvgAggregateOutputType = {
    order: number | null
  }

  export type ProductMediaSumAggregateOutputType = {
    order: number | null
  }

  export type ProductMediaMinAggregateOutputType = {
    productId: string | null
    mediaId: string | null
    order: number | null
    isPrimary: boolean | null
  }

  export type ProductMediaMaxAggregateOutputType = {
    productId: string | null
    mediaId: string | null
    order: number | null
    isPrimary: boolean | null
  }

  export type ProductMediaCountAggregateOutputType = {
    productId: number
    mediaId: number
    order: number
    isPrimary: number
    _all: number
  }


  export type ProductMediaAvgAggregateInputType = {
    order?: true
  }

  export type ProductMediaSumAggregateInputType = {
    order?: true
  }

  export type ProductMediaMinAggregateInputType = {
    productId?: true
    mediaId?: true
    order?: true
    isPrimary?: true
  }

  export type ProductMediaMaxAggregateInputType = {
    productId?: true
    mediaId?: true
    order?: true
    isPrimary?: true
  }

  export type ProductMediaCountAggregateInputType = {
    productId?: true
    mediaId?: true
    order?: true
    isPrimary?: true
    _all?: true
  }

  export type ProductMediaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProductMedia to aggregate.
     */
    where?: ProductMediaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductMedias to fetch.
     */
    orderBy?: ProductMediaOrderByWithRelationInput | ProductMediaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductMediaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductMedias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductMedias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProductMedias
    **/
    _count?: true | ProductMediaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductMediaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductMediaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductMediaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductMediaMaxAggregateInputType
  }

  export type GetProductMediaAggregateType<T extends ProductMediaAggregateArgs> = {
        [P in keyof T & keyof AggregateProductMedia]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProductMedia[P]>
      : GetScalarType<T[P], AggregateProductMedia[P]>
  }




  export type ProductMediaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductMediaWhereInput
    orderBy?: ProductMediaOrderByWithAggregationInput | ProductMediaOrderByWithAggregationInput[]
    by: ProductMediaScalarFieldEnum[] | ProductMediaScalarFieldEnum
    having?: ProductMediaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductMediaCountAggregateInputType | true
    _avg?: ProductMediaAvgAggregateInputType
    _sum?: ProductMediaSumAggregateInputType
    _min?: ProductMediaMinAggregateInputType
    _max?: ProductMediaMaxAggregateInputType
  }

  export type ProductMediaGroupByOutputType = {
    productId: string
    mediaId: string
    order: number
    isPrimary: boolean
    _count: ProductMediaCountAggregateOutputType | null
    _avg: ProductMediaAvgAggregateOutputType | null
    _sum: ProductMediaSumAggregateOutputType | null
    _min: ProductMediaMinAggregateOutputType | null
    _max: ProductMediaMaxAggregateOutputType | null
  }

  type GetProductMediaGroupByPayload<T extends ProductMediaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductMediaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductMediaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductMediaGroupByOutputType[P]>
            : GetScalarType<T[P], ProductMediaGroupByOutputType[P]>
        }
      >
    >


  export type ProductMediaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    productId?: boolean
    mediaId?: boolean
    order?: boolean
    isPrimary?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["productMedia"]>

  export type ProductMediaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    productId?: boolean
    mediaId?: boolean
    order?: boolean
    isPrimary?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["productMedia"]>

  export type ProductMediaSelectScalar = {
    productId?: boolean
    mediaId?: boolean
    order?: boolean
    isPrimary?: boolean
  }

  export type ProductMediaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type ProductMediaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }

  export type $ProductMediaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProductMedia"
    objects: {
      product: Prisma.$ProductPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      productId: string
      mediaId: string
      order: number
      isPrimary: boolean
    }, ExtArgs["result"]["productMedia"]>
    composites: {}
  }

  type ProductMediaGetPayload<S extends boolean | null | undefined | ProductMediaDefaultArgs> = $Result.GetResult<Prisma.$ProductMediaPayload, S>

  type ProductMediaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProductMediaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProductMediaCountAggregateInputType | true
    }

  export interface ProductMediaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProductMedia'], meta: { name: 'ProductMedia' } }
    /**
     * Find zero or one ProductMedia that matches the filter.
     * @param {ProductMediaFindUniqueArgs} args - Arguments to find a ProductMedia
     * @example
     * // Get one ProductMedia
     * const productMedia = await prisma.productMedia.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductMediaFindUniqueArgs>(args: SelectSubset<T, ProductMediaFindUniqueArgs<ExtArgs>>): Prisma__ProductMediaClient<$Result.GetResult<Prisma.$ProductMediaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProductMedia that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProductMediaFindUniqueOrThrowArgs} args - Arguments to find a ProductMedia
     * @example
     * // Get one ProductMedia
     * const productMedia = await prisma.productMedia.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductMediaFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductMediaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductMediaClient<$Result.GetResult<Prisma.$ProductMediaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProductMedia that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductMediaFindFirstArgs} args - Arguments to find a ProductMedia
     * @example
     * // Get one ProductMedia
     * const productMedia = await prisma.productMedia.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductMediaFindFirstArgs>(args?: SelectSubset<T, ProductMediaFindFirstArgs<ExtArgs>>): Prisma__ProductMediaClient<$Result.GetResult<Prisma.$ProductMediaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProductMedia that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductMediaFindFirstOrThrowArgs} args - Arguments to find a ProductMedia
     * @example
     * // Get one ProductMedia
     * const productMedia = await prisma.productMedia.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductMediaFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductMediaFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductMediaClient<$Result.GetResult<Prisma.$ProductMediaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProductMedias that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductMediaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProductMedias
     * const productMedias = await prisma.productMedia.findMany()
     * 
     * // Get first 10 ProductMedias
     * const productMedias = await prisma.productMedia.findMany({ take: 10 })
     * 
     * // Only select the `productId`
     * const productMediaWithProductIdOnly = await prisma.productMedia.findMany({ select: { productId: true } })
     * 
     */
    findMany<T extends ProductMediaFindManyArgs>(args?: SelectSubset<T, ProductMediaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductMediaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProductMedia.
     * @param {ProductMediaCreateArgs} args - Arguments to create a ProductMedia.
     * @example
     * // Create one ProductMedia
     * const ProductMedia = await prisma.productMedia.create({
     *   data: {
     *     // ... data to create a ProductMedia
     *   }
     * })
     * 
     */
    create<T extends ProductMediaCreateArgs>(args: SelectSubset<T, ProductMediaCreateArgs<ExtArgs>>): Prisma__ProductMediaClient<$Result.GetResult<Prisma.$ProductMediaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProductMedias.
     * @param {ProductMediaCreateManyArgs} args - Arguments to create many ProductMedias.
     * @example
     * // Create many ProductMedias
     * const productMedia = await prisma.productMedia.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductMediaCreateManyArgs>(args?: SelectSubset<T, ProductMediaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProductMedias and returns the data saved in the database.
     * @param {ProductMediaCreateManyAndReturnArgs} args - Arguments to create many ProductMedias.
     * @example
     * // Create many ProductMedias
     * const productMedia = await prisma.productMedia.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProductMedias and only return the `productId`
     * const productMediaWithProductIdOnly = await prisma.productMedia.createManyAndReturn({ 
     *   select: { productId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductMediaCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductMediaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductMediaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProductMedia.
     * @param {ProductMediaDeleteArgs} args - Arguments to delete one ProductMedia.
     * @example
     * // Delete one ProductMedia
     * const ProductMedia = await prisma.productMedia.delete({
     *   where: {
     *     // ... filter to delete one ProductMedia
     *   }
     * })
     * 
     */
    delete<T extends ProductMediaDeleteArgs>(args: SelectSubset<T, ProductMediaDeleteArgs<ExtArgs>>): Prisma__ProductMediaClient<$Result.GetResult<Prisma.$ProductMediaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProductMedia.
     * @param {ProductMediaUpdateArgs} args - Arguments to update one ProductMedia.
     * @example
     * // Update one ProductMedia
     * const productMedia = await prisma.productMedia.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductMediaUpdateArgs>(args: SelectSubset<T, ProductMediaUpdateArgs<ExtArgs>>): Prisma__ProductMediaClient<$Result.GetResult<Prisma.$ProductMediaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProductMedias.
     * @param {ProductMediaDeleteManyArgs} args - Arguments to filter ProductMedias to delete.
     * @example
     * // Delete a few ProductMedias
     * const { count } = await prisma.productMedia.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductMediaDeleteManyArgs>(args?: SelectSubset<T, ProductMediaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProductMedias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductMediaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProductMedias
     * const productMedia = await prisma.productMedia.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductMediaUpdateManyArgs>(args: SelectSubset<T, ProductMediaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProductMedia.
     * @param {ProductMediaUpsertArgs} args - Arguments to update or create a ProductMedia.
     * @example
     * // Update or create a ProductMedia
     * const productMedia = await prisma.productMedia.upsert({
     *   create: {
     *     // ... data to create a ProductMedia
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProductMedia we want to update
     *   }
     * })
     */
    upsert<T extends ProductMediaUpsertArgs>(args: SelectSubset<T, ProductMediaUpsertArgs<ExtArgs>>): Prisma__ProductMediaClient<$Result.GetResult<Prisma.$ProductMediaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProductMedias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductMediaCountArgs} args - Arguments to filter ProductMedias to count.
     * @example
     * // Count the number of ProductMedias
     * const count = await prisma.productMedia.count({
     *   where: {
     *     // ... the filter for the ProductMedias we want to count
     *   }
     * })
    **/
    count<T extends ProductMediaCountArgs>(
      args?: Subset<T, ProductMediaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductMediaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProductMedia.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductMediaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProductMediaAggregateArgs>(args: Subset<T, ProductMediaAggregateArgs>): Prisma.PrismaPromise<GetProductMediaAggregateType<T>>

    /**
     * Group by ProductMedia.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductMediaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProductMediaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductMediaGroupByArgs['orderBy'] }
        : { orderBy?: ProductMediaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProductMediaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductMediaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProductMedia model
   */
  readonly fields: ProductMediaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProductMedia.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductMediaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    product<T extends ProductDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductDefaultArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ProductMedia model
   */ 
  interface ProductMediaFieldRefs {
    readonly productId: FieldRef<"ProductMedia", 'String'>
    readonly mediaId: FieldRef<"ProductMedia", 'String'>
    readonly order: FieldRef<"ProductMedia", 'Int'>
    readonly isPrimary: FieldRef<"ProductMedia", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * ProductMedia findUnique
   */
  export type ProductMediaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMedia
     */
    select?: ProductMediaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMediaInclude<ExtArgs> | null
    /**
     * Filter, which ProductMedia to fetch.
     */
    where: ProductMediaWhereUniqueInput
  }

  /**
   * ProductMedia findUniqueOrThrow
   */
  export type ProductMediaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMedia
     */
    select?: ProductMediaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMediaInclude<ExtArgs> | null
    /**
     * Filter, which ProductMedia to fetch.
     */
    where: ProductMediaWhereUniqueInput
  }

  /**
   * ProductMedia findFirst
   */
  export type ProductMediaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMedia
     */
    select?: ProductMediaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMediaInclude<ExtArgs> | null
    /**
     * Filter, which ProductMedia to fetch.
     */
    where?: ProductMediaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductMedias to fetch.
     */
    orderBy?: ProductMediaOrderByWithRelationInput | ProductMediaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProductMedias.
     */
    cursor?: ProductMediaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductMedias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductMedias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProductMedias.
     */
    distinct?: ProductMediaScalarFieldEnum | ProductMediaScalarFieldEnum[]
  }

  /**
   * ProductMedia findFirstOrThrow
   */
  export type ProductMediaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMedia
     */
    select?: ProductMediaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMediaInclude<ExtArgs> | null
    /**
     * Filter, which ProductMedia to fetch.
     */
    where?: ProductMediaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductMedias to fetch.
     */
    orderBy?: ProductMediaOrderByWithRelationInput | ProductMediaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProductMedias.
     */
    cursor?: ProductMediaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductMedias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductMedias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProductMedias.
     */
    distinct?: ProductMediaScalarFieldEnum | ProductMediaScalarFieldEnum[]
  }

  /**
   * ProductMedia findMany
   */
  export type ProductMediaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMedia
     */
    select?: ProductMediaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMediaInclude<ExtArgs> | null
    /**
     * Filter, which ProductMedias to fetch.
     */
    where?: ProductMediaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductMedias to fetch.
     */
    orderBy?: ProductMediaOrderByWithRelationInput | ProductMediaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProductMedias.
     */
    cursor?: ProductMediaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductMedias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductMedias.
     */
    skip?: number
    distinct?: ProductMediaScalarFieldEnum | ProductMediaScalarFieldEnum[]
  }

  /**
   * ProductMedia create
   */
  export type ProductMediaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMedia
     */
    select?: ProductMediaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMediaInclude<ExtArgs> | null
    /**
     * The data needed to create a ProductMedia.
     */
    data: XOR<ProductMediaCreateInput, ProductMediaUncheckedCreateInput>
  }

  /**
   * ProductMedia createMany
   */
  export type ProductMediaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProductMedias.
     */
    data: ProductMediaCreateManyInput | ProductMediaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProductMedia createManyAndReturn
   */
  export type ProductMediaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMedia
     */
    select?: ProductMediaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProductMedias.
     */
    data: ProductMediaCreateManyInput | ProductMediaCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMediaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProductMedia update
   */
  export type ProductMediaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMedia
     */
    select?: ProductMediaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMediaInclude<ExtArgs> | null
    /**
     * The data needed to update a ProductMedia.
     */
    data: XOR<ProductMediaUpdateInput, ProductMediaUncheckedUpdateInput>
    /**
     * Choose, which ProductMedia to update.
     */
    where: ProductMediaWhereUniqueInput
  }

  /**
   * ProductMedia updateMany
   */
  export type ProductMediaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProductMedias.
     */
    data: XOR<ProductMediaUpdateManyMutationInput, ProductMediaUncheckedUpdateManyInput>
    /**
     * Filter which ProductMedias to update
     */
    where?: ProductMediaWhereInput
  }

  /**
   * ProductMedia upsert
   */
  export type ProductMediaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMedia
     */
    select?: ProductMediaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMediaInclude<ExtArgs> | null
    /**
     * The filter to search for the ProductMedia to update in case it exists.
     */
    where: ProductMediaWhereUniqueInput
    /**
     * In case the ProductMedia found by the `where` argument doesn't exist, create a new ProductMedia with this data.
     */
    create: XOR<ProductMediaCreateInput, ProductMediaUncheckedCreateInput>
    /**
     * In case the ProductMedia was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductMediaUpdateInput, ProductMediaUncheckedUpdateInput>
  }

  /**
   * ProductMedia delete
   */
  export type ProductMediaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMedia
     */
    select?: ProductMediaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMediaInclude<ExtArgs> | null
    /**
     * Filter which ProductMedia to delete.
     */
    where: ProductMediaWhereUniqueInput
  }

  /**
   * ProductMedia deleteMany
   */
  export type ProductMediaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProductMedias to delete
     */
    where?: ProductMediaWhereInput
  }

  /**
   * ProductMedia without action
   */
  export type ProductMediaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMedia
     */
    select?: ProductMediaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMediaInclude<ExtArgs> | null
  }


  /**
   * Model Outbox
   */

  export type AggregateOutbox = {
    _count: OutboxCountAggregateOutputType | null
    _min: OutboxMinAggregateOutputType | null
    _max: OutboxMaxAggregateOutputType | null
  }

  export type OutboxMinAggregateOutputType = {
    id: string | null
    aggregateId: string | null
    eventType: string | null
    createdAt: Date | null
    publishedAt: Date | null
  }

  export type OutboxMaxAggregateOutputType = {
    id: string | null
    aggregateId: string | null
    eventType: string | null
    createdAt: Date | null
    publishedAt: Date | null
  }

  export type OutboxCountAggregateOutputType = {
    id: number
    aggregateId: number
    eventType: number
    payload: number
    createdAt: number
    publishedAt: number
    _all: number
  }


  export type OutboxMinAggregateInputType = {
    id?: true
    aggregateId?: true
    eventType?: true
    createdAt?: true
    publishedAt?: true
  }

  export type OutboxMaxAggregateInputType = {
    id?: true
    aggregateId?: true
    eventType?: true
    createdAt?: true
    publishedAt?: true
  }

  export type OutboxCountAggregateInputType = {
    id?: true
    aggregateId?: true
    eventType?: true
    payload?: true
    createdAt?: true
    publishedAt?: true
    _all?: true
  }

  export type OutboxAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Outbox to aggregate.
     */
    where?: OutboxWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outboxes to fetch.
     */
    orderBy?: OutboxOrderByWithRelationInput | OutboxOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OutboxWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outboxes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outboxes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Outboxes
    **/
    _count?: true | OutboxCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OutboxMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OutboxMaxAggregateInputType
  }

  export type GetOutboxAggregateType<T extends OutboxAggregateArgs> = {
        [P in keyof T & keyof AggregateOutbox]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOutbox[P]>
      : GetScalarType<T[P], AggregateOutbox[P]>
  }




  export type OutboxGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutboxWhereInput
    orderBy?: OutboxOrderByWithAggregationInput | OutboxOrderByWithAggregationInput[]
    by: OutboxScalarFieldEnum[] | OutboxScalarFieldEnum
    having?: OutboxScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OutboxCountAggregateInputType | true
    _min?: OutboxMinAggregateInputType
    _max?: OutboxMaxAggregateInputType
  }

  export type OutboxGroupByOutputType = {
    id: string
    aggregateId: string
    eventType: string
    payload: JsonValue
    createdAt: Date
    publishedAt: Date | null
    _count: OutboxCountAggregateOutputType | null
    _min: OutboxMinAggregateOutputType | null
    _max: OutboxMaxAggregateOutputType | null
  }

  type GetOutboxGroupByPayload<T extends OutboxGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OutboxGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OutboxGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OutboxGroupByOutputType[P]>
            : GetScalarType<T[P], OutboxGroupByOutputType[P]>
        }
      >
    >


  export type OutboxSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    aggregateId?: boolean
    eventType?: boolean
    payload?: boolean
    createdAt?: boolean
    publishedAt?: boolean
  }, ExtArgs["result"]["outbox"]>

  export type OutboxSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    aggregateId?: boolean
    eventType?: boolean
    payload?: boolean
    createdAt?: boolean
    publishedAt?: boolean
  }, ExtArgs["result"]["outbox"]>

  export type OutboxSelectScalar = {
    id?: boolean
    aggregateId?: boolean
    eventType?: boolean
    payload?: boolean
    createdAt?: boolean
    publishedAt?: boolean
  }


  export type $OutboxPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Outbox"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      aggregateId: string
      eventType: string
      payload: Prisma.JsonValue
      createdAt: Date
      publishedAt: Date | null
    }, ExtArgs["result"]["outbox"]>
    composites: {}
  }

  type OutboxGetPayload<S extends boolean | null | undefined | OutboxDefaultArgs> = $Result.GetResult<Prisma.$OutboxPayload, S>

  type OutboxCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OutboxFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OutboxCountAggregateInputType | true
    }

  export interface OutboxDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Outbox'], meta: { name: 'Outbox' } }
    /**
     * Find zero or one Outbox that matches the filter.
     * @param {OutboxFindUniqueArgs} args - Arguments to find a Outbox
     * @example
     * // Get one Outbox
     * const outbox = await prisma.outbox.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OutboxFindUniqueArgs>(args: SelectSubset<T, OutboxFindUniqueArgs<ExtArgs>>): Prisma__OutboxClient<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Outbox that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OutboxFindUniqueOrThrowArgs} args - Arguments to find a Outbox
     * @example
     * // Get one Outbox
     * const outbox = await prisma.outbox.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OutboxFindUniqueOrThrowArgs>(args: SelectSubset<T, OutboxFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OutboxClient<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Outbox that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxFindFirstArgs} args - Arguments to find a Outbox
     * @example
     * // Get one Outbox
     * const outbox = await prisma.outbox.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OutboxFindFirstArgs>(args?: SelectSubset<T, OutboxFindFirstArgs<ExtArgs>>): Prisma__OutboxClient<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Outbox that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxFindFirstOrThrowArgs} args - Arguments to find a Outbox
     * @example
     * // Get one Outbox
     * const outbox = await prisma.outbox.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OutboxFindFirstOrThrowArgs>(args?: SelectSubset<T, OutboxFindFirstOrThrowArgs<ExtArgs>>): Prisma__OutboxClient<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Outboxes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Outboxes
     * const outboxes = await prisma.outbox.findMany()
     * 
     * // Get first 10 Outboxes
     * const outboxes = await prisma.outbox.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const outboxWithIdOnly = await prisma.outbox.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OutboxFindManyArgs>(args?: SelectSubset<T, OutboxFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Outbox.
     * @param {OutboxCreateArgs} args - Arguments to create a Outbox.
     * @example
     * // Create one Outbox
     * const Outbox = await prisma.outbox.create({
     *   data: {
     *     // ... data to create a Outbox
     *   }
     * })
     * 
     */
    create<T extends OutboxCreateArgs>(args: SelectSubset<T, OutboxCreateArgs<ExtArgs>>): Prisma__OutboxClient<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Outboxes.
     * @param {OutboxCreateManyArgs} args - Arguments to create many Outboxes.
     * @example
     * // Create many Outboxes
     * const outbox = await prisma.outbox.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OutboxCreateManyArgs>(args?: SelectSubset<T, OutboxCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Outboxes and returns the data saved in the database.
     * @param {OutboxCreateManyAndReturnArgs} args - Arguments to create many Outboxes.
     * @example
     * // Create many Outboxes
     * const outbox = await prisma.outbox.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Outboxes and only return the `id`
     * const outboxWithIdOnly = await prisma.outbox.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OutboxCreateManyAndReturnArgs>(args?: SelectSubset<T, OutboxCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Outbox.
     * @param {OutboxDeleteArgs} args - Arguments to delete one Outbox.
     * @example
     * // Delete one Outbox
     * const Outbox = await prisma.outbox.delete({
     *   where: {
     *     // ... filter to delete one Outbox
     *   }
     * })
     * 
     */
    delete<T extends OutboxDeleteArgs>(args: SelectSubset<T, OutboxDeleteArgs<ExtArgs>>): Prisma__OutboxClient<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Outbox.
     * @param {OutboxUpdateArgs} args - Arguments to update one Outbox.
     * @example
     * // Update one Outbox
     * const outbox = await prisma.outbox.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OutboxUpdateArgs>(args: SelectSubset<T, OutboxUpdateArgs<ExtArgs>>): Prisma__OutboxClient<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Outboxes.
     * @param {OutboxDeleteManyArgs} args - Arguments to filter Outboxes to delete.
     * @example
     * // Delete a few Outboxes
     * const { count } = await prisma.outbox.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OutboxDeleteManyArgs>(args?: SelectSubset<T, OutboxDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Outboxes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Outboxes
     * const outbox = await prisma.outbox.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OutboxUpdateManyArgs>(args: SelectSubset<T, OutboxUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Outbox.
     * @param {OutboxUpsertArgs} args - Arguments to update or create a Outbox.
     * @example
     * // Update or create a Outbox
     * const outbox = await prisma.outbox.upsert({
     *   create: {
     *     // ... data to create a Outbox
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Outbox we want to update
     *   }
     * })
     */
    upsert<T extends OutboxUpsertArgs>(args: SelectSubset<T, OutboxUpsertArgs<ExtArgs>>): Prisma__OutboxClient<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Outboxes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxCountArgs} args - Arguments to filter Outboxes to count.
     * @example
     * // Count the number of Outboxes
     * const count = await prisma.outbox.count({
     *   where: {
     *     // ... the filter for the Outboxes we want to count
     *   }
     * })
    **/
    count<T extends OutboxCountArgs>(
      args?: Subset<T, OutboxCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OutboxCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Outbox.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OutboxAggregateArgs>(args: Subset<T, OutboxAggregateArgs>): Prisma.PrismaPromise<GetOutboxAggregateType<T>>

    /**
     * Group by Outbox.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OutboxGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OutboxGroupByArgs['orderBy'] }
        : { orderBy?: OutboxGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OutboxGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOutboxGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Outbox model
   */
  readonly fields: OutboxFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Outbox.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OutboxClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Outbox model
   */ 
  interface OutboxFieldRefs {
    readonly id: FieldRef<"Outbox", 'String'>
    readonly aggregateId: FieldRef<"Outbox", 'String'>
    readonly eventType: FieldRef<"Outbox", 'String'>
    readonly payload: FieldRef<"Outbox", 'Json'>
    readonly createdAt: FieldRef<"Outbox", 'DateTime'>
    readonly publishedAt: FieldRef<"Outbox", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Outbox findUnique
   */
  export type OutboxFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * Filter, which Outbox to fetch.
     */
    where: OutboxWhereUniqueInput
  }

  /**
   * Outbox findUniqueOrThrow
   */
  export type OutboxFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * Filter, which Outbox to fetch.
     */
    where: OutboxWhereUniqueInput
  }

  /**
   * Outbox findFirst
   */
  export type OutboxFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * Filter, which Outbox to fetch.
     */
    where?: OutboxWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outboxes to fetch.
     */
    orderBy?: OutboxOrderByWithRelationInput | OutboxOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Outboxes.
     */
    cursor?: OutboxWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outboxes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outboxes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Outboxes.
     */
    distinct?: OutboxScalarFieldEnum | OutboxScalarFieldEnum[]
  }

  /**
   * Outbox findFirstOrThrow
   */
  export type OutboxFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * Filter, which Outbox to fetch.
     */
    where?: OutboxWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outboxes to fetch.
     */
    orderBy?: OutboxOrderByWithRelationInput | OutboxOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Outboxes.
     */
    cursor?: OutboxWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outboxes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outboxes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Outboxes.
     */
    distinct?: OutboxScalarFieldEnum | OutboxScalarFieldEnum[]
  }

  /**
   * Outbox findMany
   */
  export type OutboxFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * Filter, which Outboxes to fetch.
     */
    where?: OutboxWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outboxes to fetch.
     */
    orderBy?: OutboxOrderByWithRelationInput | OutboxOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Outboxes.
     */
    cursor?: OutboxWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outboxes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outboxes.
     */
    skip?: number
    distinct?: OutboxScalarFieldEnum | OutboxScalarFieldEnum[]
  }

  /**
   * Outbox create
   */
  export type OutboxCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * The data needed to create a Outbox.
     */
    data: XOR<OutboxCreateInput, OutboxUncheckedCreateInput>
  }

  /**
   * Outbox createMany
   */
  export type OutboxCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Outboxes.
     */
    data: OutboxCreateManyInput | OutboxCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Outbox createManyAndReturn
   */
  export type OutboxCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Outboxes.
     */
    data: OutboxCreateManyInput | OutboxCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Outbox update
   */
  export type OutboxUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * The data needed to update a Outbox.
     */
    data: XOR<OutboxUpdateInput, OutboxUncheckedUpdateInput>
    /**
     * Choose, which Outbox to update.
     */
    where: OutboxWhereUniqueInput
  }

  /**
   * Outbox updateMany
   */
  export type OutboxUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Outboxes.
     */
    data: XOR<OutboxUpdateManyMutationInput, OutboxUncheckedUpdateManyInput>
    /**
     * Filter which Outboxes to update
     */
    where?: OutboxWhereInput
  }

  /**
   * Outbox upsert
   */
  export type OutboxUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * The filter to search for the Outbox to update in case it exists.
     */
    where: OutboxWhereUniqueInput
    /**
     * In case the Outbox found by the `where` argument doesn't exist, create a new Outbox with this data.
     */
    create: XOR<OutboxCreateInput, OutboxUncheckedCreateInput>
    /**
     * In case the Outbox was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OutboxUpdateInput, OutboxUncheckedUpdateInput>
  }

  /**
   * Outbox delete
   */
  export type OutboxDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * Filter which Outbox to delete.
     */
    where: OutboxWhereUniqueInput
  }

  /**
   * Outbox deleteMany
   */
  export type OutboxDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Outboxes to delete
     */
    where?: OutboxWhereInput
  }

  /**
   * Outbox without action
   */
  export type OutboxDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CategoryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    parentId: 'parentId',
    order: 'order',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CategoryScalarFieldEnum = (typeof CategoryScalarFieldEnum)[keyof typeof CategoryScalarFieldEnum]


  export const BrandScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BrandScalarFieldEnum = (typeof BrandScalarFieldEnum)[keyof typeof BrandScalarFieldEnum]


  export const ProductScalarFieldEnum: {
    id: 'id',
    sku: 'sku',
    slug: 'slug',
    name: 'name',
    description: 'description',
    brandId: 'brandId',
    categoryId: 'categoryId',
    basePrice: 'basePrice',
    currency: 'currency',
    status: 'status',
    attributes: 'attributes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    publishedAt: 'publishedAt'
  };

  export type ProductScalarFieldEnum = (typeof ProductScalarFieldEnum)[keyof typeof ProductScalarFieldEnum]


  export const VariantScalarFieldEnum: {
    id: 'id',
    productId: 'productId',
    sku: 'sku',
    name: 'name',
    price: 'price',
    attributes: 'attributes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type VariantScalarFieldEnum = (typeof VariantScalarFieldEnum)[keyof typeof VariantScalarFieldEnum]


  export const ProductMediaScalarFieldEnum: {
    productId: 'productId',
    mediaId: 'mediaId',
    order: 'order',
    isPrimary: 'isPrimary'
  };

  export type ProductMediaScalarFieldEnum = (typeof ProductMediaScalarFieldEnum)[keyof typeof ProductMediaScalarFieldEnum]


  export const OutboxScalarFieldEnum: {
    id: 'id',
    aggregateId: 'aggregateId',
    eventType: 'eventType',
    payload: 'payload',
    createdAt: 'createdAt',
    publishedAt: 'publishedAt'
  };

  export type OutboxScalarFieldEnum = (typeof OutboxScalarFieldEnum)[keyof typeof OutboxScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'ProductStatus'
   */
  export type EnumProductStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProductStatus'>
    


  /**
   * Reference to a field of type 'ProductStatus[]'
   */
  export type ListEnumProductStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProductStatus[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type CategoryWhereInput = {
    AND?: CategoryWhereInput | CategoryWhereInput[]
    OR?: CategoryWhereInput[]
    NOT?: CategoryWhereInput | CategoryWhereInput[]
    id?: UuidFilter<"Category"> | string
    name?: StringFilter<"Category"> | string
    slug?: StringFilter<"Category"> | string
    parentId?: UuidNullableFilter<"Category"> | string | null
    order?: IntFilter<"Category"> | number
    createdAt?: DateTimeFilter<"Category"> | Date | string
    updatedAt?: DateTimeFilter<"Category"> | Date | string
    parent?: XOR<CategoryNullableRelationFilter, CategoryWhereInput> | null
    children?: CategoryListRelationFilter
    products?: ProductListRelationFilter
  }

  export type CategoryOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    parentId?: SortOrderInput | SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    parent?: CategoryOrderByWithRelationInput
    children?: CategoryOrderByRelationAggregateInput
    products?: ProductOrderByRelationAggregateInput
  }

  export type CategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: CategoryWhereInput | CategoryWhereInput[]
    OR?: CategoryWhereInput[]
    NOT?: CategoryWhereInput | CategoryWhereInput[]
    name?: StringFilter<"Category"> | string
    parentId?: UuidNullableFilter<"Category"> | string | null
    order?: IntFilter<"Category"> | number
    createdAt?: DateTimeFilter<"Category"> | Date | string
    updatedAt?: DateTimeFilter<"Category"> | Date | string
    parent?: XOR<CategoryNullableRelationFilter, CategoryWhereInput> | null
    children?: CategoryListRelationFilter
    products?: ProductListRelationFilter
  }, "id" | "slug">

  export type CategoryOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    parentId?: SortOrderInput | SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CategoryCountOrderByAggregateInput
    _avg?: CategoryAvgOrderByAggregateInput
    _max?: CategoryMaxOrderByAggregateInput
    _min?: CategoryMinOrderByAggregateInput
    _sum?: CategorySumOrderByAggregateInput
  }

  export type CategoryScalarWhereWithAggregatesInput = {
    AND?: CategoryScalarWhereWithAggregatesInput | CategoryScalarWhereWithAggregatesInput[]
    OR?: CategoryScalarWhereWithAggregatesInput[]
    NOT?: CategoryScalarWhereWithAggregatesInput | CategoryScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Category"> | string
    name?: StringWithAggregatesFilter<"Category"> | string
    slug?: StringWithAggregatesFilter<"Category"> | string
    parentId?: UuidNullableWithAggregatesFilter<"Category"> | string | null
    order?: IntWithAggregatesFilter<"Category"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Category"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Category"> | Date | string
  }

  export type BrandWhereInput = {
    AND?: BrandWhereInput | BrandWhereInput[]
    OR?: BrandWhereInput[]
    NOT?: BrandWhereInput | BrandWhereInput[]
    id?: UuidFilter<"Brand"> | string
    name?: StringFilter<"Brand"> | string
    slug?: StringFilter<"Brand"> | string
    createdAt?: DateTimeFilter<"Brand"> | Date | string
    updatedAt?: DateTimeFilter<"Brand"> | Date | string
    products?: ProductListRelationFilter
  }

  export type BrandOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    products?: ProductOrderByRelationAggregateInput
  }

  export type BrandWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: BrandWhereInput | BrandWhereInput[]
    OR?: BrandWhereInput[]
    NOT?: BrandWhereInput | BrandWhereInput[]
    name?: StringFilter<"Brand"> | string
    createdAt?: DateTimeFilter<"Brand"> | Date | string
    updatedAt?: DateTimeFilter<"Brand"> | Date | string
    products?: ProductListRelationFilter
  }, "id" | "slug">

  export type BrandOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BrandCountOrderByAggregateInput
    _max?: BrandMaxOrderByAggregateInput
    _min?: BrandMinOrderByAggregateInput
  }

  export type BrandScalarWhereWithAggregatesInput = {
    AND?: BrandScalarWhereWithAggregatesInput | BrandScalarWhereWithAggregatesInput[]
    OR?: BrandScalarWhereWithAggregatesInput[]
    NOT?: BrandScalarWhereWithAggregatesInput | BrandScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Brand"> | string
    name?: StringWithAggregatesFilter<"Brand"> | string
    slug?: StringWithAggregatesFilter<"Brand"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Brand"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Brand"> | Date | string
  }

  export type ProductWhereInput = {
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    id?: UuidFilter<"Product"> | string
    sku?: StringFilter<"Product"> | string
    slug?: StringFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    description?: StringFilter<"Product"> | string
    brandId?: UuidFilter<"Product"> | string
    categoryId?: UuidFilter<"Product"> | string
    basePrice?: IntFilter<"Product"> | number
    currency?: StringFilter<"Product"> | string
    status?: EnumProductStatusFilter<"Product"> | $Enums.ProductStatus
    attributes?: JsonFilter<"Product">
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    publishedAt?: DateTimeNullableFilter<"Product"> | Date | string | null
    brand?: XOR<BrandRelationFilter, BrandWhereInput>
    category?: XOR<CategoryRelationFilter, CategoryWhereInput>
    variants?: VariantListRelationFilter
    media?: ProductMediaListRelationFilter
  }

  export type ProductOrderByWithRelationInput = {
    id?: SortOrder
    sku?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    description?: SortOrder
    brandId?: SortOrder
    categoryId?: SortOrder
    basePrice?: SortOrder
    currency?: SortOrder
    status?: SortOrder
    attributes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    brand?: BrandOrderByWithRelationInput
    category?: CategoryOrderByWithRelationInput
    variants?: VariantOrderByRelationAggregateInput
    media?: ProductMediaOrderByRelationAggregateInput
  }

  export type ProductWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sku?: string
    slug?: string
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    name?: StringFilter<"Product"> | string
    description?: StringFilter<"Product"> | string
    brandId?: UuidFilter<"Product"> | string
    categoryId?: UuidFilter<"Product"> | string
    basePrice?: IntFilter<"Product"> | number
    currency?: StringFilter<"Product"> | string
    status?: EnumProductStatusFilter<"Product"> | $Enums.ProductStatus
    attributes?: JsonFilter<"Product">
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    publishedAt?: DateTimeNullableFilter<"Product"> | Date | string | null
    brand?: XOR<BrandRelationFilter, BrandWhereInput>
    category?: XOR<CategoryRelationFilter, CategoryWhereInput>
    variants?: VariantListRelationFilter
    media?: ProductMediaListRelationFilter
  }, "id" | "sku" | "slug">

  export type ProductOrderByWithAggregationInput = {
    id?: SortOrder
    sku?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    description?: SortOrder
    brandId?: SortOrder
    categoryId?: SortOrder
    basePrice?: SortOrder
    currency?: SortOrder
    status?: SortOrder
    attributes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    _count?: ProductCountOrderByAggregateInput
    _avg?: ProductAvgOrderByAggregateInput
    _max?: ProductMaxOrderByAggregateInput
    _min?: ProductMinOrderByAggregateInput
    _sum?: ProductSumOrderByAggregateInput
  }

  export type ProductScalarWhereWithAggregatesInput = {
    AND?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    OR?: ProductScalarWhereWithAggregatesInput[]
    NOT?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Product"> | string
    sku?: StringWithAggregatesFilter<"Product"> | string
    slug?: StringWithAggregatesFilter<"Product"> | string
    name?: StringWithAggregatesFilter<"Product"> | string
    description?: StringWithAggregatesFilter<"Product"> | string
    brandId?: UuidWithAggregatesFilter<"Product"> | string
    categoryId?: UuidWithAggregatesFilter<"Product"> | string
    basePrice?: IntWithAggregatesFilter<"Product"> | number
    currency?: StringWithAggregatesFilter<"Product"> | string
    status?: EnumProductStatusWithAggregatesFilter<"Product"> | $Enums.ProductStatus
    attributes?: JsonWithAggregatesFilter<"Product">
    createdAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
    publishedAt?: DateTimeNullableWithAggregatesFilter<"Product"> | Date | string | null
  }

  export type VariantWhereInput = {
    AND?: VariantWhereInput | VariantWhereInput[]
    OR?: VariantWhereInput[]
    NOT?: VariantWhereInput | VariantWhereInput[]
    id?: UuidFilter<"Variant"> | string
    productId?: UuidFilter<"Variant"> | string
    sku?: StringFilter<"Variant"> | string
    name?: StringFilter<"Variant"> | string
    price?: IntNullableFilter<"Variant"> | number | null
    attributes?: JsonFilter<"Variant">
    createdAt?: DateTimeFilter<"Variant"> | Date | string
    updatedAt?: DateTimeFilter<"Variant"> | Date | string
    product?: XOR<ProductRelationFilter, ProductWhereInput>
  }

  export type VariantOrderByWithRelationInput = {
    id?: SortOrder
    productId?: SortOrder
    sku?: SortOrder
    name?: SortOrder
    price?: SortOrderInput | SortOrder
    attributes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    product?: ProductOrderByWithRelationInput
  }

  export type VariantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sku?: string
    AND?: VariantWhereInput | VariantWhereInput[]
    OR?: VariantWhereInput[]
    NOT?: VariantWhereInput | VariantWhereInput[]
    productId?: UuidFilter<"Variant"> | string
    name?: StringFilter<"Variant"> | string
    price?: IntNullableFilter<"Variant"> | number | null
    attributes?: JsonFilter<"Variant">
    createdAt?: DateTimeFilter<"Variant"> | Date | string
    updatedAt?: DateTimeFilter<"Variant"> | Date | string
    product?: XOR<ProductRelationFilter, ProductWhereInput>
  }, "id" | "sku">

  export type VariantOrderByWithAggregationInput = {
    id?: SortOrder
    productId?: SortOrder
    sku?: SortOrder
    name?: SortOrder
    price?: SortOrderInput | SortOrder
    attributes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: VariantCountOrderByAggregateInput
    _avg?: VariantAvgOrderByAggregateInput
    _max?: VariantMaxOrderByAggregateInput
    _min?: VariantMinOrderByAggregateInput
    _sum?: VariantSumOrderByAggregateInput
  }

  export type VariantScalarWhereWithAggregatesInput = {
    AND?: VariantScalarWhereWithAggregatesInput | VariantScalarWhereWithAggregatesInput[]
    OR?: VariantScalarWhereWithAggregatesInput[]
    NOT?: VariantScalarWhereWithAggregatesInput | VariantScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Variant"> | string
    productId?: UuidWithAggregatesFilter<"Variant"> | string
    sku?: StringWithAggregatesFilter<"Variant"> | string
    name?: StringWithAggregatesFilter<"Variant"> | string
    price?: IntNullableWithAggregatesFilter<"Variant"> | number | null
    attributes?: JsonWithAggregatesFilter<"Variant">
    createdAt?: DateTimeWithAggregatesFilter<"Variant"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Variant"> | Date | string
  }

  export type ProductMediaWhereInput = {
    AND?: ProductMediaWhereInput | ProductMediaWhereInput[]
    OR?: ProductMediaWhereInput[]
    NOT?: ProductMediaWhereInput | ProductMediaWhereInput[]
    productId?: UuidFilter<"ProductMedia"> | string
    mediaId?: UuidFilter<"ProductMedia"> | string
    order?: IntFilter<"ProductMedia"> | number
    isPrimary?: BoolFilter<"ProductMedia"> | boolean
    product?: XOR<ProductRelationFilter, ProductWhereInput>
  }

  export type ProductMediaOrderByWithRelationInput = {
    productId?: SortOrder
    mediaId?: SortOrder
    order?: SortOrder
    isPrimary?: SortOrder
    product?: ProductOrderByWithRelationInput
  }

  export type ProductMediaWhereUniqueInput = Prisma.AtLeast<{
    productId_mediaId?: ProductMediaProductIdMediaIdCompoundUniqueInput
    AND?: ProductMediaWhereInput | ProductMediaWhereInput[]
    OR?: ProductMediaWhereInput[]
    NOT?: ProductMediaWhereInput | ProductMediaWhereInput[]
    productId?: UuidFilter<"ProductMedia"> | string
    mediaId?: UuidFilter<"ProductMedia"> | string
    order?: IntFilter<"ProductMedia"> | number
    isPrimary?: BoolFilter<"ProductMedia"> | boolean
    product?: XOR<ProductRelationFilter, ProductWhereInput>
  }, "productId_mediaId">

  export type ProductMediaOrderByWithAggregationInput = {
    productId?: SortOrder
    mediaId?: SortOrder
    order?: SortOrder
    isPrimary?: SortOrder
    _count?: ProductMediaCountOrderByAggregateInput
    _avg?: ProductMediaAvgOrderByAggregateInput
    _max?: ProductMediaMaxOrderByAggregateInput
    _min?: ProductMediaMinOrderByAggregateInput
    _sum?: ProductMediaSumOrderByAggregateInput
  }

  export type ProductMediaScalarWhereWithAggregatesInput = {
    AND?: ProductMediaScalarWhereWithAggregatesInput | ProductMediaScalarWhereWithAggregatesInput[]
    OR?: ProductMediaScalarWhereWithAggregatesInput[]
    NOT?: ProductMediaScalarWhereWithAggregatesInput | ProductMediaScalarWhereWithAggregatesInput[]
    productId?: UuidWithAggregatesFilter<"ProductMedia"> | string
    mediaId?: UuidWithAggregatesFilter<"ProductMedia"> | string
    order?: IntWithAggregatesFilter<"ProductMedia"> | number
    isPrimary?: BoolWithAggregatesFilter<"ProductMedia"> | boolean
  }

  export type OutboxWhereInput = {
    AND?: OutboxWhereInput | OutboxWhereInput[]
    OR?: OutboxWhereInput[]
    NOT?: OutboxWhereInput | OutboxWhereInput[]
    id?: UuidFilter<"Outbox"> | string
    aggregateId?: UuidFilter<"Outbox"> | string
    eventType?: StringFilter<"Outbox"> | string
    payload?: JsonFilter<"Outbox">
    createdAt?: DateTimeFilter<"Outbox"> | Date | string
    publishedAt?: DateTimeNullableFilter<"Outbox"> | Date | string | null
  }

  export type OutboxOrderByWithRelationInput = {
    id?: SortOrder
    aggregateId?: SortOrder
    eventType?: SortOrder
    payload?: SortOrder
    createdAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
  }

  export type OutboxWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OutboxWhereInput | OutboxWhereInput[]
    OR?: OutboxWhereInput[]
    NOT?: OutboxWhereInput | OutboxWhereInput[]
    aggregateId?: UuidFilter<"Outbox"> | string
    eventType?: StringFilter<"Outbox"> | string
    payload?: JsonFilter<"Outbox">
    createdAt?: DateTimeFilter<"Outbox"> | Date | string
    publishedAt?: DateTimeNullableFilter<"Outbox"> | Date | string | null
  }, "id">

  export type OutboxOrderByWithAggregationInput = {
    id?: SortOrder
    aggregateId?: SortOrder
    eventType?: SortOrder
    payload?: SortOrder
    createdAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    _count?: OutboxCountOrderByAggregateInput
    _max?: OutboxMaxOrderByAggregateInput
    _min?: OutboxMinOrderByAggregateInput
  }

  export type OutboxScalarWhereWithAggregatesInput = {
    AND?: OutboxScalarWhereWithAggregatesInput | OutboxScalarWhereWithAggregatesInput[]
    OR?: OutboxScalarWhereWithAggregatesInput[]
    NOT?: OutboxScalarWhereWithAggregatesInput | OutboxScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Outbox"> | string
    aggregateId?: UuidWithAggregatesFilter<"Outbox"> | string
    eventType?: StringWithAggregatesFilter<"Outbox"> | string
    payload?: JsonWithAggregatesFilter<"Outbox">
    createdAt?: DateTimeWithAggregatesFilter<"Outbox"> | Date | string
    publishedAt?: DateTimeNullableWithAggregatesFilter<"Outbox"> | Date | string | null
  }

  export type CategoryCreateInput = {
    id: string
    name: string
    slug: string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: CategoryCreateNestedOneWithoutChildrenInput
    children?: CategoryCreateNestedManyWithoutParentInput
    products?: ProductCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUncheckedCreateInput = {
    id: string
    name: string
    slug: string
    parentId?: string | null
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput
    products?: ProductUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: CategoryUpdateOneWithoutChildrenNestedInput
    children?: CategoryUpdateManyWithoutParentNestedInput
    products?: ProductUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput
    products?: ProductUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryCreateManyInput = {
    id: string
    name: string
    slug: string
    parentId?: string | null
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CategoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandCreateInput = {
    id: string
    name: string
    slug: string
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductCreateNestedManyWithoutBrandInput
  }

  export type BrandUncheckedCreateInput = {
    id: string
    name: string
    slug: string
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductUncheckedCreateNestedManyWithoutBrandInput
  }

  export type BrandUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUpdateManyWithoutBrandNestedInput
  }

  export type BrandUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUncheckedUpdateManyWithoutBrandNestedInput
  }

  export type BrandCreateManyInput = {
    id: string
    name: string
    slug: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCreateInput = {
    id: string
    sku: string
    slug: string
    name: string
    description?: string
    basePrice: number
    currency?: string
    status?: $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    brand: BrandCreateNestedOneWithoutProductsInput
    category: CategoryCreateNestedOneWithoutProductsInput
    variants?: VariantCreateNestedManyWithoutProductInput
    media?: ProductMediaCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateInput = {
    id: string
    sku: string
    slug: string
    name: string
    description?: string
    brandId: string
    categoryId: string
    basePrice: number
    currency?: string
    status?: $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    variants?: VariantUncheckedCreateNestedManyWithoutProductInput
    media?: ProductMediaUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    basePrice?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    brand?: BrandUpdateOneRequiredWithoutProductsNestedInput
    category?: CategoryUpdateOneRequiredWithoutProductsNestedInput
    variants?: VariantUpdateManyWithoutProductNestedInput
    media?: ProductMediaUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    basePrice?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    variants?: VariantUncheckedUpdateManyWithoutProductNestedInput
    media?: ProductMediaUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductCreateManyInput = {
    id: string
    sku: string
    slug: string
    name: string
    description?: string
    brandId: string
    categoryId: string
    basePrice: number
    currency?: string
    status?: $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type ProductUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    basePrice?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ProductUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    basePrice?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type VariantCreateInput = {
    id: string
    sku: string
    name: string
    price?: number | null
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    product: ProductCreateNestedOneWithoutVariantsInput
  }

  export type VariantUncheckedCreateInput = {
    id: string
    productId: string
    sku: string
    name: string
    price?: number | null
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VariantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    price?: NullableIntFieldUpdateOperationsInput | number | null
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    product?: ProductUpdateOneRequiredWithoutVariantsNestedInput
  }

  export type VariantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    price?: NullableIntFieldUpdateOperationsInput | number | null
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VariantCreateManyInput = {
    id: string
    productId: string
    sku: string
    name: string
    price?: number | null
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VariantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    price?: NullableIntFieldUpdateOperationsInput | number | null
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VariantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    price?: NullableIntFieldUpdateOperationsInput | number | null
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductMediaCreateInput = {
    mediaId: string
    order?: number
    isPrimary?: boolean
    product: ProductCreateNestedOneWithoutMediaInput
  }

  export type ProductMediaUncheckedCreateInput = {
    productId: string
    mediaId: string
    order?: number
    isPrimary?: boolean
  }

  export type ProductMediaUpdateInput = {
    mediaId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    product?: ProductUpdateOneRequiredWithoutMediaNestedInput
  }

  export type ProductMediaUncheckedUpdateInput = {
    productId?: StringFieldUpdateOperationsInput | string
    mediaId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ProductMediaCreateManyInput = {
    productId: string
    mediaId: string
    order?: number
    isPrimary?: boolean
  }

  export type ProductMediaUpdateManyMutationInput = {
    mediaId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ProductMediaUncheckedUpdateManyInput = {
    productId?: StringFieldUpdateOperationsInput | string
    mediaId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
  }

  export type OutboxCreateInput = {
    id: string
    aggregateId: string
    eventType: string
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type OutboxUncheckedCreateInput = {
    id: string
    aggregateId: string
    eventType: string
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type OutboxUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    aggregateId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OutboxUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    aggregateId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OutboxCreateManyInput = {
    id: string
    aggregateId: string
    eventType: string
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type OutboxUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    aggregateId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OutboxUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    aggregateId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CategoryNullableRelationFilter = {
    is?: CategoryWhereInput | null
    isNot?: CategoryWhereInput | null
  }

  export type CategoryListRelationFilter = {
    every?: CategoryWhereInput
    some?: CategoryWhereInput
    none?: CategoryWhereInput
  }

  export type ProductListRelationFilter = {
    every?: ProductWhereInput
    some?: ProductWhereInput
    none?: ProductWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CategoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CategoryCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    parentId?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategoryAvgOrderByAggregateInput = {
    order?: SortOrder
  }

  export type CategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    parentId?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategoryMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    parentId?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategorySumOrderByAggregateInput = {
    order?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BrandCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BrandMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BrandMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumProductStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ProductStatus | EnumProductStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProductStatusFilter<$PrismaModel> | $Enums.ProductStatus
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type BrandRelationFilter = {
    is?: BrandWhereInput
    isNot?: BrandWhereInput
  }

  export type CategoryRelationFilter = {
    is?: CategoryWhereInput
    isNot?: CategoryWhereInput
  }

  export type VariantListRelationFilter = {
    every?: VariantWhereInput
    some?: VariantWhereInput
    none?: VariantWhereInput
  }

  export type ProductMediaListRelationFilter = {
    every?: ProductMediaWhereInput
    some?: ProductMediaWhereInput
    none?: ProductMediaWhereInput
  }

  export type VariantOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductMediaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductCountOrderByAggregateInput = {
    id?: SortOrder
    sku?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    description?: SortOrder
    brandId?: SortOrder
    categoryId?: SortOrder
    basePrice?: SortOrder
    currency?: SortOrder
    status?: SortOrder
    attributes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type ProductAvgOrderByAggregateInput = {
    basePrice?: SortOrder
  }

  export type ProductMaxOrderByAggregateInput = {
    id?: SortOrder
    sku?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    description?: SortOrder
    brandId?: SortOrder
    categoryId?: SortOrder
    basePrice?: SortOrder
    currency?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type ProductMinOrderByAggregateInput = {
    id?: SortOrder
    sku?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    description?: SortOrder
    brandId?: SortOrder
    categoryId?: SortOrder
    basePrice?: SortOrder
    currency?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type ProductSumOrderByAggregateInput = {
    basePrice?: SortOrder
  }

  export type EnumProductStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProductStatus | EnumProductStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProductStatusWithAggregatesFilter<$PrismaModel> | $Enums.ProductStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProductStatusFilter<$PrismaModel>
    _max?: NestedEnumProductStatusFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type ProductRelationFilter = {
    is?: ProductWhereInput
    isNot?: ProductWhereInput
  }

  export type VariantCountOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    sku?: SortOrder
    name?: SortOrder
    price?: SortOrder
    attributes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VariantAvgOrderByAggregateInput = {
    price?: SortOrder
  }

  export type VariantMaxOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    sku?: SortOrder
    name?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VariantMinOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    sku?: SortOrder
    name?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VariantSumOrderByAggregateInput = {
    price?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ProductMediaProductIdMediaIdCompoundUniqueInput = {
    productId: string
    mediaId: string
  }

  export type ProductMediaCountOrderByAggregateInput = {
    productId?: SortOrder
    mediaId?: SortOrder
    order?: SortOrder
    isPrimary?: SortOrder
  }

  export type ProductMediaAvgOrderByAggregateInput = {
    order?: SortOrder
  }

  export type ProductMediaMaxOrderByAggregateInput = {
    productId?: SortOrder
    mediaId?: SortOrder
    order?: SortOrder
    isPrimary?: SortOrder
  }

  export type ProductMediaMinOrderByAggregateInput = {
    productId?: SortOrder
    mediaId?: SortOrder
    order?: SortOrder
    isPrimary?: SortOrder
  }

  export type ProductMediaSumOrderByAggregateInput = {
    order?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type OutboxCountOrderByAggregateInput = {
    id?: SortOrder
    aggregateId?: SortOrder
    eventType?: SortOrder
    payload?: SortOrder
    createdAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type OutboxMaxOrderByAggregateInput = {
    id?: SortOrder
    aggregateId?: SortOrder
    eventType?: SortOrder
    createdAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type OutboxMinOrderByAggregateInput = {
    id?: SortOrder
    aggregateId?: SortOrder
    eventType?: SortOrder
    createdAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type CategoryCreateNestedOneWithoutChildrenInput = {
    create?: XOR<CategoryCreateWithoutChildrenInput, CategoryUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutChildrenInput
    connect?: CategoryWhereUniqueInput
  }

  export type CategoryCreateNestedManyWithoutParentInput = {
    create?: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput> | CategoryCreateWithoutParentInput[] | CategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutParentInput | CategoryCreateOrConnectWithoutParentInput[]
    createMany?: CategoryCreateManyParentInputEnvelope
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
  }

  export type ProductCreateNestedManyWithoutCategoryInput = {
    create?: XOR<ProductCreateWithoutCategoryInput, ProductUncheckedCreateWithoutCategoryInput> | ProductCreateWithoutCategoryInput[] | ProductUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCategoryInput | ProductCreateOrConnectWithoutCategoryInput[]
    createMany?: ProductCreateManyCategoryInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type CategoryUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput> | CategoryCreateWithoutParentInput[] | CategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutParentInput | CategoryCreateOrConnectWithoutParentInput[]
    createMany?: CategoryCreateManyParentInputEnvelope
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
  }

  export type ProductUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<ProductCreateWithoutCategoryInput, ProductUncheckedCreateWithoutCategoryInput> | ProductCreateWithoutCategoryInput[] | ProductUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCategoryInput | ProductCreateOrConnectWithoutCategoryInput[]
    createMany?: ProductCreateManyCategoryInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CategoryUpdateOneWithoutChildrenNestedInput = {
    create?: XOR<CategoryCreateWithoutChildrenInput, CategoryUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutChildrenInput
    upsert?: CategoryUpsertWithoutChildrenInput
    disconnect?: CategoryWhereInput | boolean
    delete?: CategoryWhereInput | boolean
    connect?: CategoryWhereUniqueInput
    update?: XOR<XOR<CategoryUpdateToOneWithWhereWithoutChildrenInput, CategoryUpdateWithoutChildrenInput>, CategoryUncheckedUpdateWithoutChildrenInput>
  }

  export type CategoryUpdateManyWithoutParentNestedInput = {
    create?: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput> | CategoryCreateWithoutParentInput[] | CategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutParentInput | CategoryCreateOrConnectWithoutParentInput[]
    upsert?: CategoryUpsertWithWhereUniqueWithoutParentInput | CategoryUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: CategoryCreateManyParentInputEnvelope
    set?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    disconnect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    delete?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    update?: CategoryUpdateWithWhereUniqueWithoutParentInput | CategoryUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: CategoryUpdateManyWithWhereWithoutParentInput | CategoryUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: CategoryScalarWhereInput | CategoryScalarWhereInput[]
  }

  export type ProductUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<ProductCreateWithoutCategoryInput, ProductUncheckedCreateWithoutCategoryInput> | ProductCreateWithoutCategoryInput[] | ProductUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCategoryInput | ProductCreateOrConnectWithoutCategoryInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutCategoryInput | ProductUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: ProductCreateManyCategoryInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutCategoryInput | ProductUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutCategoryInput | ProductUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type CategoryUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput> | CategoryCreateWithoutParentInput[] | CategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutParentInput | CategoryCreateOrConnectWithoutParentInput[]
    upsert?: CategoryUpsertWithWhereUniqueWithoutParentInput | CategoryUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: CategoryCreateManyParentInputEnvelope
    set?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    disconnect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    delete?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    update?: CategoryUpdateWithWhereUniqueWithoutParentInput | CategoryUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: CategoryUpdateManyWithWhereWithoutParentInput | CategoryUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: CategoryScalarWhereInput | CategoryScalarWhereInput[]
  }

  export type ProductUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<ProductCreateWithoutCategoryInput, ProductUncheckedCreateWithoutCategoryInput> | ProductCreateWithoutCategoryInput[] | ProductUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCategoryInput | ProductCreateOrConnectWithoutCategoryInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutCategoryInput | ProductUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: ProductCreateManyCategoryInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutCategoryInput | ProductUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutCategoryInput | ProductUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type ProductCreateNestedManyWithoutBrandInput = {
    create?: XOR<ProductCreateWithoutBrandInput, ProductUncheckedCreateWithoutBrandInput> | ProductCreateWithoutBrandInput[] | ProductUncheckedCreateWithoutBrandInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutBrandInput | ProductCreateOrConnectWithoutBrandInput[]
    createMany?: ProductCreateManyBrandInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type ProductUncheckedCreateNestedManyWithoutBrandInput = {
    create?: XOR<ProductCreateWithoutBrandInput, ProductUncheckedCreateWithoutBrandInput> | ProductCreateWithoutBrandInput[] | ProductUncheckedCreateWithoutBrandInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutBrandInput | ProductCreateOrConnectWithoutBrandInput[]
    createMany?: ProductCreateManyBrandInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type ProductUpdateManyWithoutBrandNestedInput = {
    create?: XOR<ProductCreateWithoutBrandInput, ProductUncheckedCreateWithoutBrandInput> | ProductCreateWithoutBrandInput[] | ProductUncheckedCreateWithoutBrandInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutBrandInput | ProductCreateOrConnectWithoutBrandInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutBrandInput | ProductUpsertWithWhereUniqueWithoutBrandInput[]
    createMany?: ProductCreateManyBrandInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutBrandInput | ProductUpdateWithWhereUniqueWithoutBrandInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutBrandInput | ProductUpdateManyWithWhereWithoutBrandInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type ProductUncheckedUpdateManyWithoutBrandNestedInput = {
    create?: XOR<ProductCreateWithoutBrandInput, ProductUncheckedCreateWithoutBrandInput> | ProductCreateWithoutBrandInput[] | ProductUncheckedCreateWithoutBrandInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutBrandInput | ProductCreateOrConnectWithoutBrandInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutBrandInput | ProductUpsertWithWhereUniqueWithoutBrandInput[]
    createMany?: ProductCreateManyBrandInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutBrandInput | ProductUpdateWithWhereUniqueWithoutBrandInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutBrandInput | ProductUpdateManyWithWhereWithoutBrandInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type BrandCreateNestedOneWithoutProductsInput = {
    create?: XOR<BrandCreateWithoutProductsInput, BrandUncheckedCreateWithoutProductsInput>
    connectOrCreate?: BrandCreateOrConnectWithoutProductsInput
    connect?: BrandWhereUniqueInput
  }

  export type CategoryCreateNestedOneWithoutProductsInput = {
    create?: XOR<CategoryCreateWithoutProductsInput, CategoryUncheckedCreateWithoutProductsInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutProductsInput
    connect?: CategoryWhereUniqueInput
  }

  export type VariantCreateNestedManyWithoutProductInput = {
    create?: XOR<VariantCreateWithoutProductInput, VariantUncheckedCreateWithoutProductInput> | VariantCreateWithoutProductInput[] | VariantUncheckedCreateWithoutProductInput[]
    connectOrCreate?: VariantCreateOrConnectWithoutProductInput | VariantCreateOrConnectWithoutProductInput[]
    createMany?: VariantCreateManyProductInputEnvelope
    connect?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
  }

  export type ProductMediaCreateNestedManyWithoutProductInput = {
    create?: XOR<ProductMediaCreateWithoutProductInput, ProductMediaUncheckedCreateWithoutProductInput> | ProductMediaCreateWithoutProductInput[] | ProductMediaUncheckedCreateWithoutProductInput[]
    connectOrCreate?: ProductMediaCreateOrConnectWithoutProductInput | ProductMediaCreateOrConnectWithoutProductInput[]
    createMany?: ProductMediaCreateManyProductInputEnvelope
    connect?: ProductMediaWhereUniqueInput | ProductMediaWhereUniqueInput[]
  }

  export type VariantUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<VariantCreateWithoutProductInput, VariantUncheckedCreateWithoutProductInput> | VariantCreateWithoutProductInput[] | VariantUncheckedCreateWithoutProductInput[]
    connectOrCreate?: VariantCreateOrConnectWithoutProductInput | VariantCreateOrConnectWithoutProductInput[]
    createMany?: VariantCreateManyProductInputEnvelope
    connect?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
  }

  export type ProductMediaUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<ProductMediaCreateWithoutProductInput, ProductMediaUncheckedCreateWithoutProductInput> | ProductMediaCreateWithoutProductInput[] | ProductMediaUncheckedCreateWithoutProductInput[]
    connectOrCreate?: ProductMediaCreateOrConnectWithoutProductInput | ProductMediaCreateOrConnectWithoutProductInput[]
    createMany?: ProductMediaCreateManyProductInputEnvelope
    connect?: ProductMediaWhereUniqueInput | ProductMediaWhereUniqueInput[]
  }

  export type EnumProductStatusFieldUpdateOperationsInput = {
    set?: $Enums.ProductStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type BrandUpdateOneRequiredWithoutProductsNestedInput = {
    create?: XOR<BrandCreateWithoutProductsInput, BrandUncheckedCreateWithoutProductsInput>
    connectOrCreate?: BrandCreateOrConnectWithoutProductsInput
    upsert?: BrandUpsertWithoutProductsInput
    connect?: BrandWhereUniqueInput
    update?: XOR<XOR<BrandUpdateToOneWithWhereWithoutProductsInput, BrandUpdateWithoutProductsInput>, BrandUncheckedUpdateWithoutProductsInput>
  }

  export type CategoryUpdateOneRequiredWithoutProductsNestedInput = {
    create?: XOR<CategoryCreateWithoutProductsInput, CategoryUncheckedCreateWithoutProductsInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutProductsInput
    upsert?: CategoryUpsertWithoutProductsInput
    connect?: CategoryWhereUniqueInput
    update?: XOR<XOR<CategoryUpdateToOneWithWhereWithoutProductsInput, CategoryUpdateWithoutProductsInput>, CategoryUncheckedUpdateWithoutProductsInput>
  }

  export type VariantUpdateManyWithoutProductNestedInput = {
    create?: XOR<VariantCreateWithoutProductInput, VariantUncheckedCreateWithoutProductInput> | VariantCreateWithoutProductInput[] | VariantUncheckedCreateWithoutProductInput[]
    connectOrCreate?: VariantCreateOrConnectWithoutProductInput | VariantCreateOrConnectWithoutProductInput[]
    upsert?: VariantUpsertWithWhereUniqueWithoutProductInput | VariantUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: VariantCreateManyProductInputEnvelope
    set?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
    disconnect?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
    delete?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
    connect?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
    update?: VariantUpdateWithWhereUniqueWithoutProductInput | VariantUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: VariantUpdateManyWithWhereWithoutProductInput | VariantUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: VariantScalarWhereInput | VariantScalarWhereInput[]
  }

  export type ProductMediaUpdateManyWithoutProductNestedInput = {
    create?: XOR<ProductMediaCreateWithoutProductInput, ProductMediaUncheckedCreateWithoutProductInput> | ProductMediaCreateWithoutProductInput[] | ProductMediaUncheckedCreateWithoutProductInput[]
    connectOrCreate?: ProductMediaCreateOrConnectWithoutProductInput | ProductMediaCreateOrConnectWithoutProductInput[]
    upsert?: ProductMediaUpsertWithWhereUniqueWithoutProductInput | ProductMediaUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: ProductMediaCreateManyProductInputEnvelope
    set?: ProductMediaWhereUniqueInput | ProductMediaWhereUniqueInput[]
    disconnect?: ProductMediaWhereUniqueInput | ProductMediaWhereUniqueInput[]
    delete?: ProductMediaWhereUniqueInput | ProductMediaWhereUniqueInput[]
    connect?: ProductMediaWhereUniqueInput | ProductMediaWhereUniqueInput[]
    update?: ProductMediaUpdateWithWhereUniqueWithoutProductInput | ProductMediaUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: ProductMediaUpdateManyWithWhereWithoutProductInput | ProductMediaUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: ProductMediaScalarWhereInput | ProductMediaScalarWhereInput[]
  }

  export type VariantUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<VariantCreateWithoutProductInput, VariantUncheckedCreateWithoutProductInput> | VariantCreateWithoutProductInput[] | VariantUncheckedCreateWithoutProductInput[]
    connectOrCreate?: VariantCreateOrConnectWithoutProductInput | VariantCreateOrConnectWithoutProductInput[]
    upsert?: VariantUpsertWithWhereUniqueWithoutProductInput | VariantUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: VariantCreateManyProductInputEnvelope
    set?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
    disconnect?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
    delete?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
    connect?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
    update?: VariantUpdateWithWhereUniqueWithoutProductInput | VariantUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: VariantUpdateManyWithWhereWithoutProductInput | VariantUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: VariantScalarWhereInput | VariantScalarWhereInput[]
  }

  export type ProductMediaUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<ProductMediaCreateWithoutProductInput, ProductMediaUncheckedCreateWithoutProductInput> | ProductMediaCreateWithoutProductInput[] | ProductMediaUncheckedCreateWithoutProductInput[]
    connectOrCreate?: ProductMediaCreateOrConnectWithoutProductInput | ProductMediaCreateOrConnectWithoutProductInput[]
    upsert?: ProductMediaUpsertWithWhereUniqueWithoutProductInput | ProductMediaUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: ProductMediaCreateManyProductInputEnvelope
    set?: ProductMediaWhereUniqueInput | ProductMediaWhereUniqueInput[]
    disconnect?: ProductMediaWhereUniqueInput | ProductMediaWhereUniqueInput[]
    delete?: ProductMediaWhereUniqueInput | ProductMediaWhereUniqueInput[]
    connect?: ProductMediaWhereUniqueInput | ProductMediaWhereUniqueInput[]
    update?: ProductMediaUpdateWithWhereUniqueWithoutProductInput | ProductMediaUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: ProductMediaUpdateManyWithWhereWithoutProductInput | ProductMediaUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: ProductMediaScalarWhereInput | ProductMediaScalarWhereInput[]
  }

  export type ProductCreateNestedOneWithoutVariantsInput = {
    create?: XOR<ProductCreateWithoutVariantsInput, ProductUncheckedCreateWithoutVariantsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutVariantsInput
    connect?: ProductWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ProductUpdateOneRequiredWithoutVariantsNestedInput = {
    create?: XOR<ProductCreateWithoutVariantsInput, ProductUncheckedCreateWithoutVariantsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutVariantsInput
    upsert?: ProductUpsertWithoutVariantsInput
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutVariantsInput, ProductUpdateWithoutVariantsInput>, ProductUncheckedUpdateWithoutVariantsInput>
  }

  export type ProductCreateNestedOneWithoutMediaInput = {
    create?: XOR<ProductCreateWithoutMediaInput, ProductUncheckedCreateWithoutMediaInput>
    connectOrCreate?: ProductCreateOrConnectWithoutMediaInput
    connect?: ProductWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ProductUpdateOneRequiredWithoutMediaNestedInput = {
    create?: XOR<ProductCreateWithoutMediaInput, ProductUncheckedCreateWithoutMediaInput>
    connectOrCreate?: ProductCreateOrConnectWithoutMediaInput
    upsert?: ProductUpsertWithoutMediaInput
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutMediaInput, ProductUpdateWithoutMediaInput>, ProductUncheckedUpdateWithoutMediaInput>
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumProductStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ProductStatus | EnumProductStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProductStatusFilter<$PrismaModel> | $Enums.ProductStatus
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumProductStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProductStatus | EnumProductStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProductStatusWithAggregatesFilter<$PrismaModel> | $Enums.ProductStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProductStatusFilter<$PrismaModel>
    _max?: NestedEnumProductStatusFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type CategoryCreateWithoutChildrenInput = {
    id: string
    name: string
    slug: string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: CategoryCreateNestedOneWithoutChildrenInput
    products?: ProductCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUncheckedCreateWithoutChildrenInput = {
    id: string
    name: string
    slug: string
    parentId?: string | null
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type CategoryCreateOrConnectWithoutChildrenInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutChildrenInput, CategoryUncheckedCreateWithoutChildrenInput>
  }

  export type CategoryCreateWithoutParentInput = {
    id: string
    name: string
    slug: string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: CategoryCreateNestedManyWithoutParentInput
    products?: ProductCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUncheckedCreateWithoutParentInput = {
    id: string
    name: string
    slug: string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput
    products?: ProductUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type CategoryCreateOrConnectWithoutParentInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput>
  }

  export type CategoryCreateManyParentInputEnvelope = {
    data: CategoryCreateManyParentInput | CategoryCreateManyParentInput[]
    skipDuplicates?: boolean
  }

  export type ProductCreateWithoutCategoryInput = {
    id: string
    sku: string
    slug: string
    name: string
    description?: string
    basePrice: number
    currency?: string
    status?: $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    brand: BrandCreateNestedOneWithoutProductsInput
    variants?: VariantCreateNestedManyWithoutProductInput
    media?: ProductMediaCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateWithoutCategoryInput = {
    id: string
    sku: string
    slug: string
    name: string
    description?: string
    brandId: string
    basePrice: number
    currency?: string
    status?: $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    variants?: VariantUncheckedCreateNestedManyWithoutProductInput
    media?: ProductMediaUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutCategoryInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutCategoryInput, ProductUncheckedCreateWithoutCategoryInput>
  }

  export type ProductCreateManyCategoryInputEnvelope = {
    data: ProductCreateManyCategoryInput | ProductCreateManyCategoryInput[]
    skipDuplicates?: boolean
  }

  export type CategoryUpsertWithoutChildrenInput = {
    update: XOR<CategoryUpdateWithoutChildrenInput, CategoryUncheckedUpdateWithoutChildrenInput>
    create: XOR<CategoryCreateWithoutChildrenInput, CategoryUncheckedCreateWithoutChildrenInput>
    where?: CategoryWhereInput
  }

  export type CategoryUpdateToOneWithWhereWithoutChildrenInput = {
    where?: CategoryWhereInput
    data: XOR<CategoryUpdateWithoutChildrenInput, CategoryUncheckedUpdateWithoutChildrenInput>
  }

  export type CategoryUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: CategoryUpdateOneWithoutChildrenNestedInput
    products?: ProductUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUpsertWithWhereUniqueWithoutParentInput = {
    where: CategoryWhereUniqueInput
    update: XOR<CategoryUpdateWithoutParentInput, CategoryUncheckedUpdateWithoutParentInput>
    create: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput>
  }

  export type CategoryUpdateWithWhereUniqueWithoutParentInput = {
    where: CategoryWhereUniqueInput
    data: XOR<CategoryUpdateWithoutParentInput, CategoryUncheckedUpdateWithoutParentInput>
  }

  export type CategoryUpdateManyWithWhereWithoutParentInput = {
    where: CategoryScalarWhereInput
    data: XOR<CategoryUpdateManyMutationInput, CategoryUncheckedUpdateManyWithoutParentInput>
  }

  export type CategoryScalarWhereInput = {
    AND?: CategoryScalarWhereInput | CategoryScalarWhereInput[]
    OR?: CategoryScalarWhereInput[]
    NOT?: CategoryScalarWhereInput | CategoryScalarWhereInput[]
    id?: UuidFilter<"Category"> | string
    name?: StringFilter<"Category"> | string
    slug?: StringFilter<"Category"> | string
    parentId?: UuidNullableFilter<"Category"> | string | null
    order?: IntFilter<"Category"> | number
    createdAt?: DateTimeFilter<"Category"> | Date | string
    updatedAt?: DateTimeFilter<"Category"> | Date | string
  }

  export type ProductUpsertWithWhereUniqueWithoutCategoryInput = {
    where: ProductWhereUniqueInput
    update: XOR<ProductUpdateWithoutCategoryInput, ProductUncheckedUpdateWithoutCategoryInput>
    create: XOR<ProductCreateWithoutCategoryInput, ProductUncheckedCreateWithoutCategoryInput>
  }

  export type ProductUpdateWithWhereUniqueWithoutCategoryInput = {
    where: ProductWhereUniqueInput
    data: XOR<ProductUpdateWithoutCategoryInput, ProductUncheckedUpdateWithoutCategoryInput>
  }

  export type ProductUpdateManyWithWhereWithoutCategoryInput = {
    where: ProductScalarWhereInput
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyWithoutCategoryInput>
  }

  export type ProductScalarWhereInput = {
    AND?: ProductScalarWhereInput | ProductScalarWhereInput[]
    OR?: ProductScalarWhereInput[]
    NOT?: ProductScalarWhereInput | ProductScalarWhereInput[]
    id?: UuidFilter<"Product"> | string
    sku?: StringFilter<"Product"> | string
    slug?: StringFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    description?: StringFilter<"Product"> | string
    brandId?: UuidFilter<"Product"> | string
    categoryId?: UuidFilter<"Product"> | string
    basePrice?: IntFilter<"Product"> | number
    currency?: StringFilter<"Product"> | string
    status?: EnumProductStatusFilter<"Product"> | $Enums.ProductStatus
    attributes?: JsonFilter<"Product">
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    publishedAt?: DateTimeNullableFilter<"Product"> | Date | string | null
  }

  export type ProductCreateWithoutBrandInput = {
    id: string
    sku: string
    slug: string
    name: string
    description?: string
    basePrice: number
    currency?: string
    status?: $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    category: CategoryCreateNestedOneWithoutProductsInput
    variants?: VariantCreateNestedManyWithoutProductInput
    media?: ProductMediaCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateWithoutBrandInput = {
    id: string
    sku: string
    slug: string
    name: string
    description?: string
    categoryId: string
    basePrice: number
    currency?: string
    status?: $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    variants?: VariantUncheckedCreateNestedManyWithoutProductInput
    media?: ProductMediaUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutBrandInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutBrandInput, ProductUncheckedCreateWithoutBrandInput>
  }

  export type ProductCreateManyBrandInputEnvelope = {
    data: ProductCreateManyBrandInput | ProductCreateManyBrandInput[]
    skipDuplicates?: boolean
  }

  export type ProductUpsertWithWhereUniqueWithoutBrandInput = {
    where: ProductWhereUniqueInput
    update: XOR<ProductUpdateWithoutBrandInput, ProductUncheckedUpdateWithoutBrandInput>
    create: XOR<ProductCreateWithoutBrandInput, ProductUncheckedCreateWithoutBrandInput>
  }

  export type ProductUpdateWithWhereUniqueWithoutBrandInput = {
    where: ProductWhereUniqueInput
    data: XOR<ProductUpdateWithoutBrandInput, ProductUncheckedUpdateWithoutBrandInput>
  }

  export type ProductUpdateManyWithWhereWithoutBrandInput = {
    where: ProductScalarWhereInput
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyWithoutBrandInput>
  }

  export type BrandCreateWithoutProductsInput = {
    id: string
    name: string
    slug: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandUncheckedCreateWithoutProductsInput = {
    id: string
    name: string
    slug: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandCreateOrConnectWithoutProductsInput = {
    where: BrandWhereUniqueInput
    create: XOR<BrandCreateWithoutProductsInput, BrandUncheckedCreateWithoutProductsInput>
  }

  export type CategoryCreateWithoutProductsInput = {
    id: string
    name: string
    slug: string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: CategoryCreateNestedOneWithoutChildrenInput
    children?: CategoryCreateNestedManyWithoutParentInput
  }

  export type CategoryUncheckedCreateWithoutProductsInput = {
    id: string
    name: string
    slug: string
    parentId?: string | null
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput
  }

  export type CategoryCreateOrConnectWithoutProductsInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutProductsInput, CategoryUncheckedCreateWithoutProductsInput>
  }

  export type VariantCreateWithoutProductInput = {
    id: string
    sku: string
    name: string
    price?: number | null
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VariantUncheckedCreateWithoutProductInput = {
    id: string
    sku: string
    name: string
    price?: number | null
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VariantCreateOrConnectWithoutProductInput = {
    where: VariantWhereUniqueInput
    create: XOR<VariantCreateWithoutProductInput, VariantUncheckedCreateWithoutProductInput>
  }

  export type VariantCreateManyProductInputEnvelope = {
    data: VariantCreateManyProductInput | VariantCreateManyProductInput[]
    skipDuplicates?: boolean
  }

  export type ProductMediaCreateWithoutProductInput = {
    mediaId: string
    order?: number
    isPrimary?: boolean
  }

  export type ProductMediaUncheckedCreateWithoutProductInput = {
    mediaId: string
    order?: number
    isPrimary?: boolean
  }

  export type ProductMediaCreateOrConnectWithoutProductInput = {
    where: ProductMediaWhereUniqueInput
    create: XOR<ProductMediaCreateWithoutProductInput, ProductMediaUncheckedCreateWithoutProductInput>
  }

  export type ProductMediaCreateManyProductInputEnvelope = {
    data: ProductMediaCreateManyProductInput | ProductMediaCreateManyProductInput[]
    skipDuplicates?: boolean
  }

  export type BrandUpsertWithoutProductsInput = {
    update: XOR<BrandUpdateWithoutProductsInput, BrandUncheckedUpdateWithoutProductsInput>
    create: XOR<BrandCreateWithoutProductsInput, BrandUncheckedCreateWithoutProductsInput>
    where?: BrandWhereInput
  }

  export type BrandUpdateToOneWithWhereWithoutProductsInput = {
    where?: BrandWhereInput
    data: XOR<BrandUpdateWithoutProductsInput, BrandUncheckedUpdateWithoutProductsInput>
  }

  export type BrandUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandUncheckedUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryUpsertWithoutProductsInput = {
    update: XOR<CategoryUpdateWithoutProductsInput, CategoryUncheckedUpdateWithoutProductsInput>
    create: XOR<CategoryCreateWithoutProductsInput, CategoryUncheckedCreateWithoutProductsInput>
    where?: CategoryWhereInput
  }

  export type CategoryUpdateToOneWithWhereWithoutProductsInput = {
    where?: CategoryWhereInput
    data: XOR<CategoryUpdateWithoutProductsInput, CategoryUncheckedUpdateWithoutProductsInput>
  }

  export type CategoryUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: CategoryUpdateOneWithoutChildrenNestedInput
    children?: CategoryUpdateManyWithoutParentNestedInput
  }

  export type CategoryUncheckedUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput
  }

  export type VariantUpsertWithWhereUniqueWithoutProductInput = {
    where: VariantWhereUniqueInput
    update: XOR<VariantUpdateWithoutProductInput, VariantUncheckedUpdateWithoutProductInput>
    create: XOR<VariantCreateWithoutProductInput, VariantUncheckedCreateWithoutProductInput>
  }

  export type VariantUpdateWithWhereUniqueWithoutProductInput = {
    where: VariantWhereUniqueInput
    data: XOR<VariantUpdateWithoutProductInput, VariantUncheckedUpdateWithoutProductInput>
  }

  export type VariantUpdateManyWithWhereWithoutProductInput = {
    where: VariantScalarWhereInput
    data: XOR<VariantUpdateManyMutationInput, VariantUncheckedUpdateManyWithoutProductInput>
  }

  export type VariantScalarWhereInput = {
    AND?: VariantScalarWhereInput | VariantScalarWhereInput[]
    OR?: VariantScalarWhereInput[]
    NOT?: VariantScalarWhereInput | VariantScalarWhereInput[]
    id?: UuidFilter<"Variant"> | string
    productId?: UuidFilter<"Variant"> | string
    sku?: StringFilter<"Variant"> | string
    name?: StringFilter<"Variant"> | string
    price?: IntNullableFilter<"Variant"> | number | null
    attributes?: JsonFilter<"Variant">
    createdAt?: DateTimeFilter<"Variant"> | Date | string
    updatedAt?: DateTimeFilter<"Variant"> | Date | string
  }

  export type ProductMediaUpsertWithWhereUniqueWithoutProductInput = {
    where: ProductMediaWhereUniqueInput
    update: XOR<ProductMediaUpdateWithoutProductInput, ProductMediaUncheckedUpdateWithoutProductInput>
    create: XOR<ProductMediaCreateWithoutProductInput, ProductMediaUncheckedCreateWithoutProductInput>
  }

  export type ProductMediaUpdateWithWhereUniqueWithoutProductInput = {
    where: ProductMediaWhereUniqueInput
    data: XOR<ProductMediaUpdateWithoutProductInput, ProductMediaUncheckedUpdateWithoutProductInput>
  }

  export type ProductMediaUpdateManyWithWhereWithoutProductInput = {
    where: ProductMediaScalarWhereInput
    data: XOR<ProductMediaUpdateManyMutationInput, ProductMediaUncheckedUpdateManyWithoutProductInput>
  }

  export type ProductMediaScalarWhereInput = {
    AND?: ProductMediaScalarWhereInput | ProductMediaScalarWhereInput[]
    OR?: ProductMediaScalarWhereInput[]
    NOT?: ProductMediaScalarWhereInput | ProductMediaScalarWhereInput[]
    productId?: UuidFilter<"ProductMedia"> | string
    mediaId?: UuidFilter<"ProductMedia"> | string
    order?: IntFilter<"ProductMedia"> | number
    isPrimary?: BoolFilter<"ProductMedia"> | boolean
  }

  export type ProductCreateWithoutVariantsInput = {
    id: string
    sku: string
    slug: string
    name: string
    description?: string
    basePrice: number
    currency?: string
    status?: $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    brand: BrandCreateNestedOneWithoutProductsInput
    category: CategoryCreateNestedOneWithoutProductsInput
    media?: ProductMediaCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateWithoutVariantsInput = {
    id: string
    sku: string
    slug: string
    name: string
    description?: string
    brandId: string
    categoryId: string
    basePrice: number
    currency?: string
    status?: $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    media?: ProductMediaUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutVariantsInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutVariantsInput, ProductUncheckedCreateWithoutVariantsInput>
  }

  export type ProductUpsertWithoutVariantsInput = {
    update: XOR<ProductUpdateWithoutVariantsInput, ProductUncheckedUpdateWithoutVariantsInput>
    create: XOR<ProductCreateWithoutVariantsInput, ProductUncheckedCreateWithoutVariantsInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutVariantsInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutVariantsInput, ProductUncheckedUpdateWithoutVariantsInput>
  }

  export type ProductUpdateWithoutVariantsInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    basePrice?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    brand?: BrandUpdateOneRequiredWithoutProductsNestedInput
    category?: CategoryUpdateOneRequiredWithoutProductsNestedInput
    media?: ProductMediaUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateWithoutVariantsInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    basePrice?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    media?: ProductMediaUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductCreateWithoutMediaInput = {
    id: string
    sku: string
    slug: string
    name: string
    description?: string
    basePrice: number
    currency?: string
    status?: $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    brand: BrandCreateNestedOneWithoutProductsInput
    category: CategoryCreateNestedOneWithoutProductsInput
    variants?: VariantCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateWithoutMediaInput = {
    id: string
    sku: string
    slug: string
    name: string
    description?: string
    brandId: string
    categoryId: string
    basePrice: number
    currency?: string
    status?: $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
    variants?: VariantUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutMediaInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutMediaInput, ProductUncheckedCreateWithoutMediaInput>
  }

  export type ProductUpsertWithoutMediaInput = {
    update: XOR<ProductUpdateWithoutMediaInput, ProductUncheckedUpdateWithoutMediaInput>
    create: XOR<ProductCreateWithoutMediaInput, ProductUncheckedCreateWithoutMediaInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutMediaInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutMediaInput, ProductUncheckedUpdateWithoutMediaInput>
  }

  export type ProductUpdateWithoutMediaInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    basePrice?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    brand?: BrandUpdateOneRequiredWithoutProductsNestedInput
    category?: CategoryUpdateOneRequiredWithoutProductsNestedInput
    variants?: VariantUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateWithoutMediaInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    basePrice?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    variants?: VariantUncheckedUpdateManyWithoutProductNestedInput
  }

  export type CategoryCreateManyParentInput = {
    id: string
    name: string
    slug: string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductCreateManyCategoryInput = {
    id: string
    sku: string
    slug: string
    name: string
    description?: string
    brandId: string
    basePrice: number
    currency?: string
    status?: $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type CategoryUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: CategoryUpdateManyWithoutParentNestedInput
    products?: ProductUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput
    products?: ProductUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateManyWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    basePrice?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    brand?: BrandUpdateOneRequiredWithoutProductsNestedInput
    variants?: VariantUpdateManyWithoutProductNestedInput
    media?: ProductMediaUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    basePrice?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    variants?: VariantUncheckedUpdateManyWithoutProductNestedInput
    media?: ProductMediaUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    basePrice?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ProductCreateManyBrandInput = {
    id: string
    sku: string
    slug: string
    name: string
    description?: string
    categoryId: string
    basePrice: number
    currency?: string
    status?: $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type ProductUpdateWithoutBrandInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    basePrice?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    category?: CategoryUpdateOneRequiredWithoutProductsNestedInput
    variants?: VariantUpdateManyWithoutProductNestedInput
    media?: ProductMediaUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateWithoutBrandInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    basePrice?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    variants?: VariantUncheckedUpdateManyWithoutProductNestedInput
    media?: ProductMediaUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateManyWithoutBrandInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    basePrice?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type VariantCreateManyProductInput = {
    id: string
    sku: string
    name: string
    price?: number | null
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductMediaCreateManyProductInput = {
    mediaId: string
    order?: number
    isPrimary?: boolean
  }

  export type VariantUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    price?: NullableIntFieldUpdateOperationsInput | number | null
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VariantUncheckedUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    price?: NullableIntFieldUpdateOperationsInput | number | null
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VariantUncheckedUpdateManyWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    price?: NullableIntFieldUpdateOperationsInput | number | null
    attributes?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductMediaUpdateWithoutProductInput = {
    mediaId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ProductMediaUncheckedUpdateWithoutProductInput = {
    mediaId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ProductMediaUncheckedUpdateManyWithoutProductInput = {
    mediaId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use CategoryCountOutputTypeDefaultArgs instead
     */
    export type CategoryCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CategoryCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use BrandCountOutputTypeDefaultArgs instead
     */
    export type BrandCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BrandCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProductCountOutputTypeDefaultArgs instead
     */
    export type ProductCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProductCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CategoryDefaultArgs instead
     */
    export type CategoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CategoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use BrandDefaultArgs instead
     */
    export type BrandArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BrandDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProductDefaultArgs instead
     */
    export type ProductArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProductDefaultArgs<ExtArgs>
    /**
     * @deprecated Use VariantDefaultArgs instead
     */
    export type VariantArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = VariantDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProductMediaDefaultArgs instead
     */
    export type ProductMediaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProductMediaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OutboxDefaultArgs instead
     */
    export type OutboxArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OutboxDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}