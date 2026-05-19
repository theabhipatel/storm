
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
 * Model MediaAsset
 * 
 */
export type MediaAsset = $Result.DefaultSelection<Prisma.$MediaAssetPayload>
/**
 * Model Thumbnail
 * 
 */
export type Thumbnail = $Result.DefaultSelection<Prisma.$ThumbnailPayload>
/**
 * Model Outbox
 * 
 */
export type Outbox = $Result.DefaultSelection<Prisma.$OutboxPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const MediaStatus: {
  pending: 'pending',
  confirmed: 'confirmed',
  ready: 'ready',
  failed: 'failed'
};

export type MediaStatus = (typeof MediaStatus)[keyof typeof MediaStatus]


export const ThumbnailVariant: {
  sm: 'sm',
  md: 'md',
  lg: 'lg'
};

export type ThumbnailVariant = (typeof ThumbnailVariant)[keyof typeof ThumbnailVariant]

}

export type MediaStatus = $Enums.MediaStatus

export const MediaStatus: typeof $Enums.MediaStatus

export type ThumbnailVariant = $Enums.ThumbnailVariant

export const ThumbnailVariant: typeof $Enums.ThumbnailVariant

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more MediaAssets
 * const mediaAssets = await prisma.mediaAsset.findMany()
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
   * // Fetch zero or more MediaAssets
   * const mediaAssets = await prisma.mediaAsset.findMany()
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
   * `prisma.mediaAsset`: Exposes CRUD operations for the **MediaAsset** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MediaAssets
    * const mediaAssets = await prisma.mediaAsset.findMany()
    * ```
    */
  get mediaAsset(): Prisma.MediaAssetDelegate<ExtArgs>;

  /**
   * `prisma.thumbnail`: Exposes CRUD operations for the **Thumbnail** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Thumbnails
    * const thumbnails = await prisma.thumbnail.findMany()
    * ```
    */
  get thumbnail(): Prisma.ThumbnailDelegate<ExtArgs>;

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
    MediaAsset: 'MediaAsset',
    Thumbnail: 'Thumbnail',
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
      modelProps: "mediaAsset" | "thumbnail" | "outbox"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      MediaAsset: {
        payload: Prisma.$MediaAssetPayload<ExtArgs>
        fields: Prisma.MediaAssetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MediaAssetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaAssetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MediaAssetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaAssetPayload>
          }
          findFirst: {
            args: Prisma.MediaAssetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaAssetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MediaAssetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaAssetPayload>
          }
          findMany: {
            args: Prisma.MediaAssetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaAssetPayload>[]
          }
          create: {
            args: Prisma.MediaAssetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaAssetPayload>
          }
          createMany: {
            args: Prisma.MediaAssetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MediaAssetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaAssetPayload>[]
          }
          delete: {
            args: Prisma.MediaAssetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaAssetPayload>
          }
          update: {
            args: Prisma.MediaAssetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaAssetPayload>
          }
          deleteMany: {
            args: Prisma.MediaAssetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MediaAssetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MediaAssetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaAssetPayload>
          }
          aggregate: {
            args: Prisma.MediaAssetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMediaAsset>
          }
          groupBy: {
            args: Prisma.MediaAssetGroupByArgs<ExtArgs>
            result: $Utils.Optional<MediaAssetGroupByOutputType>[]
          }
          count: {
            args: Prisma.MediaAssetCountArgs<ExtArgs>
            result: $Utils.Optional<MediaAssetCountAggregateOutputType> | number
          }
        }
      }
      Thumbnail: {
        payload: Prisma.$ThumbnailPayload<ExtArgs>
        fields: Prisma.ThumbnailFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ThumbnailFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThumbnailPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ThumbnailFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThumbnailPayload>
          }
          findFirst: {
            args: Prisma.ThumbnailFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThumbnailPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ThumbnailFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThumbnailPayload>
          }
          findMany: {
            args: Prisma.ThumbnailFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThumbnailPayload>[]
          }
          create: {
            args: Prisma.ThumbnailCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThumbnailPayload>
          }
          createMany: {
            args: Prisma.ThumbnailCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ThumbnailCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThumbnailPayload>[]
          }
          delete: {
            args: Prisma.ThumbnailDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThumbnailPayload>
          }
          update: {
            args: Prisma.ThumbnailUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThumbnailPayload>
          }
          deleteMany: {
            args: Prisma.ThumbnailDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ThumbnailUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ThumbnailUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThumbnailPayload>
          }
          aggregate: {
            args: Prisma.ThumbnailAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateThumbnail>
          }
          groupBy: {
            args: Prisma.ThumbnailGroupByArgs<ExtArgs>
            result: $Utils.Optional<ThumbnailGroupByOutputType>[]
          }
          count: {
            args: Prisma.ThumbnailCountArgs<ExtArgs>
            result: $Utils.Optional<ThumbnailCountAggregateOutputType> | number
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
   * Count Type MediaAssetCountOutputType
   */

  export type MediaAssetCountOutputType = {
    thumbnails: number
  }

  export type MediaAssetCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    thumbnails?: boolean | MediaAssetCountOutputTypeCountThumbnailsArgs
  }

  // Custom InputTypes
  /**
   * MediaAssetCountOutputType without action
   */
  export type MediaAssetCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaAssetCountOutputType
     */
    select?: MediaAssetCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MediaAssetCountOutputType without action
   */
  export type MediaAssetCountOutputTypeCountThumbnailsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ThumbnailWhereInput
  }


  /**
   * Models
   */

  /**
   * Model MediaAsset
   */

  export type AggregateMediaAsset = {
    _count: MediaAssetCountAggregateOutputType | null
    _avg: MediaAssetAvgAggregateOutputType | null
    _sum: MediaAssetSumAggregateOutputType | null
    _min: MediaAssetMinAggregateOutputType | null
    _max: MediaAssetMaxAggregateOutputType | null
  }

  export type MediaAssetAvgAggregateOutputType = {
    sizeBytes: number | null
    width: number | null
    height: number | null
    retryCount: number | null
  }

  export type MediaAssetSumAggregateOutputType = {
    sizeBytes: number | null
    width: number | null
    height: number | null
    retryCount: number | null
  }

  export type MediaAssetMinAggregateOutputType = {
    id: string | null
    s3Key: string | null
    contentType: string | null
    sizeBytes: number | null
    width: number | null
    height: number | null
    status: $Enums.MediaStatus | null
    uploadedBy: string | null
    altText: string | null
    failureReason: string | null
    retryCount: number | null
    createdAt: Date | null
    updatedAt: Date | null
    confirmedAt: Date | null
    readyAt: Date | null
  }

  export type MediaAssetMaxAggregateOutputType = {
    id: string | null
    s3Key: string | null
    contentType: string | null
    sizeBytes: number | null
    width: number | null
    height: number | null
    status: $Enums.MediaStatus | null
    uploadedBy: string | null
    altText: string | null
    failureReason: string | null
    retryCount: number | null
    createdAt: Date | null
    updatedAt: Date | null
    confirmedAt: Date | null
    readyAt: Date | null
  }

  export type MediaAssetCountAggregateOutputType = {
    id: number
    s3Key: number
    contentType: number
    sizeBytes: number
    width: number
    height: number
    status: number
    uploadedBy: number
    altText: number
    failureReason: number
    retryCount: number
    createdAt: number
    updatedAt: number
    confirmedAt: number
    readyAt: number
    _all: number
  }


  export type MediaAssetAvgAggregateInputType = {
    sizeBytes?: true
    width?: true
    height?: true
    retryCount?: true
  }

  export type MediaAssetSumAggregateInputType = {
    sizeBytes?: true
    width?: true
    height?: true
    retryCount?: true
  }

  export type MediaAssetMinAggregateInputType = {
    id?: true
    s3Key?: true
    contentType?: true
    sizeBytes?: true
    width?: true
    height?: true
    status?: true
    uploadedBy?: true
    altText?: true
    failureReason?: true
    retryCount?: true
    createdAt?: true
    updatedAt?: true
    confirmedAt?: true
    readyAt?: true
  }

  export type MediaAssetMaxAggregateInputType = {
    id?: true
    s3Key?: true
    contentType?: true
    sizeBytes?: true
    width?: true
    height?: true
    status?: true
    uploadedBy?: true
    altText?: true
    failureReason?: true
    retryCount?: true
    createdAt?: true
    updatedAt?: true
    confirmedAt?: true
    readyAt?: true
  }

  export type MediaAssetCountAggregateInputType = {
    id?: true
    s3Key?: true
    contentType?: true
    sizeBytes?: true
    width?: true
    height?: true
    status?: true
    uploadedBy?: true
    altText?: true
    failureReason?: true
    retryCount?: true
    createdAt?: true
    updatedAt?: true
    confirmedAt?: true
    readyAt?: true
    _all?: true
  }

  export type MediaAssetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MediaAsset to aggregate.
     */
    where?: MediaAssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MediaAssets to fetch.
     */
    orderBy?: MediaAssetOrderByWithRelationInput | MediaAssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MediaAssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MediaAssets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MediaAssets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MediaAssets
    **/
    _count?: true | MediaAssetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MediaAssetAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MediaAssetSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MediaAssetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MediaAssetMaxAggregateInputType
  }

  export type GetMediaAssetAggregateType<T extends MediaAssetAggregateArgs> = {
        [P in keyof T & keyof AggregateMediaAsset]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMediaAsset[P]>
      : GetScalarType<T[P], AggregateMediaAsset[P]>
  }




  export type MediaAssetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MediaAssetWhereInput
    orderBy?: MediaAssetOrderByWithAggregationInput | MediaAssetOrderByWithAggregationInput[]
    by: MediaAssetScalarFieldEnum[] | MediaAssetScalarFieldEnum
    having?: MediaAssetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MediaAssetCountAggregateInputType | true
    _avg?: MediaAssetAvgAggregateInputType
    _sum?: MediaAssetSumAggregateInputType
    _min?: MediaAssetMinAggregateInputType
    _max?: MediaAssetMaxAggregateInputType
  }

  export type MediaAssetGroupByOutputType = {
    id: string
    s3Key: string
    contentType: string
    sizeBytes: number
    width: number | null
    height: number | null
    status: $Enums.MediaStatus
    uploadedBy: string
    altText: string | null
    failureReason: string | null
    retryCount: number
    createdAt: Date
    updatedAt: Date
    confirmedAt: Date | null
    readyAt: Date | null
    _count: MediaAssetCountAggregateOutputType | null
    _avg: MediaAssetAvgAggregateOutputType | null
    _sum: MediaAssetSumAggregateOutputType | null
    _min: MediaAssetMinAggregateOutputType | null
    _max: MediaAssetMaxAggregateOutputType | null
  }

  type GetMediaAssetGroupByPayload<T extends MediaAssetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MediaAssetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MediaAssetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MediaAssetGroupByOutputType[P]>
            : GetScalarType<T[P], MediaAssetGroupByOutputType[P]>
        }
      >
    >


  export type MediaAssetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    s3Key?: boolean
    contentType?: boolean
    sizeBytes?: boolean
    width?: boolean
    height?: boolean
    status?: boolean
    uploadedBy?: boolean
    altText?: boolean
    failureReason?: boolean
    retryCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    confirmedAt?: boolean
    readyAt?: boolean
    thumbnails?: boolean | MediaAsset$thumbnailsArgs<ExtArgs>
    _count?: boolean | MediaAssetCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mediaAsset"]>

  export type MediaAssetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    s3Key?: boolean
    contentType?: boolean
    sizeBytes?: boolean
    width?: boolean
    height?: boolean
    status?: boolean
    uploadedBy?: boolean
    altText?: boolean
    failureReason?: boolean
    retryCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    confirmedAt?: boolean
    readyAt?: boolean
  }, ExtArgs["result"]["mediaAsset"]>

  export type MediaAssetSelectScalar = {
    id?: boolean
    s3Key?: boolean
    contentType?: boolean
    sizeBytes?: boolean
    width?: boolean
    height?: boolean
    status?: boolean
    uploadedBy?: boolean
    altText?: boolean
    failureReason?: boolean
    retryCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    confirmedAt?: boolean
    readyAt?: boolean
  }

  export type MediaAssetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    thumbnails?: boolean | MediaAsset$thumbnailsArgs<ExtArgs>
    _count?: boolean | MediaAssetCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MediaAssetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $MediaAssetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MediaAsset"
    objects: {
      thumbnails: Prisma.$ThumbnailPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      s3Key: string
      contentType: string
      sizeBytes: number
      width: number | null
      height: number | null
      status: $Enums.MediaStatus
      uploadedBy: string
      altText: string | null
      failureReason: string | null
      retryCount: number
      createdAt: Date
      updatedAt: Date
      confirmedAt: Date | null
      readyAt: Date | null
    }, ExtArgs["result"]["mediaAsset"]>
    composites: {}
  }

  type MediaAssetGetPayload<S extends boolean | null | undefined | MediaAssetDefaultArgs> = $Result.GetResult<Prisma.$MediaAssetPayload, S>

  type MediaAssetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MediaAssetFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MediaAssetCountAggregateInputType | true
    }

  export interface MediaAssetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MediaAsset'], meta: { name: 'MediaAsset' } }
    /**
     * Find zero or one MediaAsset that matches the filter.
     * @param {MediaAssetFindUniqueArgs} args - Arguments to find a MediaAsset
     * @example
     * // Get one MediaAsset
     * const mediaAsset = await prisma.mediaAsset.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MediaAssetFindUniqueArgs>(args: SelectSubset<T, MediaAssetFindUniqueArgs<ExtArgs>>): Prisma__MediaAssetClient<$Result.GetResult<Prisma.$MediaAssetPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MediaAsset that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MediaAssetFindUniqueOrThrowArgs} args - Arguments to find a MediaAsset
     * @example
     * // Get one MediaAsset
     * const mediaAsset = await prisma.mediaAsset.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MediaAssetFindUniqueOrThrowArgs>(args: SelectSubset<T, MediaAssetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MediaAssetClient<$Result.GetResult<Prisma.$MediaAssetPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MediaAsset that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MediaAssetFindFirstArgs} args - Arguments to find a MediaAsset
     * @example
     * // Get one MediaAsset
     * const mediaAsset = await prisma.mediaAsset.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MediaAssetFindFirstArgs>(args?: SelectSubset<T, MediaAssetFindFirstArgs<ExtArgs>>): Prisma__MediaAssetClient<$Result.GetResult<Prisma.$MediaAssetPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MediaAsset that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MediaAssetFindFirstOrThrowArgs} args - Arguments to find a MediaAsset
     * @example
     * // Get one MediaAsset
     * const mediaAsset = await prisma.mediaAsset.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MediaAssetFindFirstOrThrowArgs>(args?: SelectSubset<T, MediaAssetFindFirstOrThrowArgs<ExtArgs>>): Prisma__MediaAssetClient<$Result.GetResult<Prisma.$MediaAssetPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MediaAssets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MediaAssetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MediaAssets
     * const mediaAssets = await prisma.mediaAsset.findMany()
     * 
     * // Get first 10 MediaAssets
     * const mediaAssets = await prisma.mediaAsset.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const mediaAssetWithIdOnly = await prisma.mediaAsset.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MediaAssetFindManyArgs>(args?: SelectSubset<T, MediaAssetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MediaAssetPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MediaAsset.
     * @param {MediaAssetCreateArgs} args - Arguments to create a MediaAsset.
     * @example
     * // Create one MediaAsset
     * const MediaAsset = await prisma.mediaAsset.create({
     *   data: {
     *     // ... data to create a MediaAsset
     *   }
     * })
     * 
     */
    create<T extends MediaAssetCreateArgs>(args: SelectSubset<T, MediaAssetCreateArgs<ExtArgs>>): Prisma__MediaAssetClient<$Result.GetResult<Prisma.$MediaAssetPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MediaAssets.
     * @param {MediaAssetCreateManyArgs} args - Arguments to create many MediaAssets.
     * @example
     * // Create many MediaAssets
     * const mediaAsset = await prisma.mediaAsset.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MediaAssetCreateManyArgs>(args?: SelectSubset<T, MediaAssetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MediaAssets and returns the data saved in the database.
     * @param {MediaAssetCreateManyAndReturnArgs} args - Arguments to create many MediaAssets.
     * @example
     * // Create many MediaAssets
     * const mediaAsset = await prisma.mediaAsset.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MediaAssets and only return the `id`
     * const mediaAssetWithIdOnly = await prisma.mediaAsset.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MediaAssetCreateManyAndReturnArgs>(args?: SelectSubset<T, MediaAssetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MediaAssetPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MediaAsset.
     * @param {MediaAssetDeleteArgs} args - Arguments to delete one MediaAsset.
     * @example
     * // Delete one MediaAsset
     * const MediaAsset = await prisma.mediaAsset.delete({
     *   where: {
     *     // ... filter to delete one MediaAsset
     *   }
     * })
     * 
     */
    delete<T extends MediaAssetDeleteArgs>(args: SelectSubset<T, MediaAssetDeleteArgs<ExtArgs>>): Prisma__MediaAssetClient<$Result.GetResult<Prisma.$MediaAssetPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MediaAsset.
     * @param {MediaAssetUpdateArgs} args - Arguments to update one MediaAsset.
     * @example
     * // Update one MediaAsset
     * const mediaAsset = await prisma.mediaAsset.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MediaAssetUpdateArgs>(args: SelectSubset<T, MediaAssetUpdateArgs<ExtArgs>>): Prisma__MediaAssetClient<$Result.GetResult<Prisma.$MediaAssetPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MediaAssets.
     * @param {MediaAssetDeleteManyArgs} args - Arguments to filter MediaAssets to delete.
     * @example
     * // Delete a few MediaAssets
     * const { count } = await prisma.mediaAsset.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MediaAssetDeleteManyArgs>(args?: SelectSubset<T, MediaAssetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MediaAssets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MediaAssetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MediaAssets
     * const mediaAsset = await prisma.mediaAsset.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MediaAssetUpdateManyArgs>(args: SelectSubset<T, MediaAssetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MediaAsset.
     * @param {MediaAssetUpsertArgs} args - Arguments to update or create a MediaAsset.
     * @example
     * // Update or create a MediaAsset
     * const mediaAsset = await prisma.mediaAsset.upsert({
     *   create: {
     *     // ... data to create a MediaAsset
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MediaAsset we want to update
     *   }
     * })
     */
    upsert<T extends MediaAssetUpsertArgs>(args: SelectSubset<T, MediaAssetUpsertArgs<ExtArgs>>): Prisma__MediaAssetClient<$Result.GetResult<Prisma.$MediaAssetPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MediaAssets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MediaAssetCountArgs} args - Arguments to filter MediaAssets to count.
     * @example
     * // Count the number of MediaAssets
     * const count = await prisma.mediaAsset.count({
     *   where: {
     *     // ... the filter for the MediaAssets we want to count
     *   }
     * })
    **/
    count<T extends MediaAssetCountArgs>(
      args?: Subset<T, MediaAssetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MediaAssetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MediaAsset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MediaAssetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MediaAssetAggregateArgs>(args: Subset<T, MediaAssetAggregateArgs>): Prisma.PrismaPromise<GetMediaAssetAggregateType<T>>

    /**
     * Group by MediaAsset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MediaAssetGroupByArgs} args - Group by arguments.
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
      T extends MediaAssetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MediaAssetGroupByArgs['orderBy'] }
        : { orderBy?: MediaAssetGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, MediaAssetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMediaAssetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MediaAsset model
   */
  readonly fields: MediaAssetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MediaAsset.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MediaAssetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    thumbnails<T extends MediaAsset$thumbnailsArgs<ExtArgs> = {}>(args?: Subset<T, MediaAsset$thumbnailsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ThumbnailPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the MediaAsset model
   */ 
  interface MediaAssetFieldRefs {
    readonly id: FieldRef<"MediaAsset", 'String'>
    readonly s3Key: FieldRef<"MediaAsset", 'String'>
    readonly contentType: FieldRef<"MediaAsset", 'String'>
    readonly sizeBytes: FieldRef<"MediaAsset", 'Int'>
    readonly width: FieldRef<"MediaAsset", 'Int'>
    readonly height: FieldRef<"MediaAsset", 'Int'>
    readonly status: FieldRef<"MediaAsset", 'MediaStatus'>
    readonly uploadedBy: FieldRef<"MediaAsset", 'String'>
    readonly altText: FieldRef<"MediaAsset", 'String'>
    readonly failureReason: FieldRef<"MediaAsset", 'String'>
    readonly retryCount: FieldRef<"MediaAsset", 'Int'>
    readonly createdAt: FieldRef<"MediaAsset", 'DateTime'>
    readonly updatedAt: FieldRef<"MediaAsset", 'DateTime'>
    readonly confirmedAt: FieldRef<"MediaAsset", 'DateTime'>
    readonly readyAt: FieldRef<"MediaAsset", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MediaAsset findUnique
   */
  export type MediaAssetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaAsset
     */
    select?: MediaAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MediaAssetInclude<ExtArgs> | null
    /**
     * Filter, which MediaAsset to fetch.
     */
    where: MediaAssetWhereUniqueInput
  }

  /**
   * MediaAsset findUniqueOrThrow
   */
  export type MediaAssetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaAsset
     */
    select?: MediaAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MediaAssetInclude<ExtArgs> | null
    /**
     * Filter, which MediaAsset to fetch.
     */
    where: MediaAssetWhereUniqueInput
  }

  /**
   * MediaAsset findFirst
   */
  export type MediaAssetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaAsset
     */
    select?: MediaAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MediaAssetInclude<ExtArgs> | null
    /**
     * Filter, which MediaAsset to fetch.
     */
    where?: MediaAssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MediaAssets to fetch.
     */
    orderBy?: MediaAssetOrderByWithRelationInput | MediaAssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MediaAssets.
     */
    cursor?: MediaAssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MediaAssets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MediaAssets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MediaAssets.
     */
    distinct?: MediaAssetScalarFieldEnum | MediaAssetScalarFieldEnum[]
  }

  /**
   * MediaAsset findFirstOrThrow
   */
  export type MediaAssetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaAsset
     */
    select?: MediaAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MediaAssetInclude<ExtArgs> | null
    /**
     * Filter, which MediaAsset to fetch.
     */
    where?: MediaAssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MediaAssets to fetch.
     */
    orderBy?: MediaAssetOrderByWithRelationInput | MediaAssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MediaAssets.
     */
    cursor?: MediaAssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MediaAssets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MediaAssets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MediaAssets.
     */
    distinct?: MediaAssetScalarFieldEnum | MediaAssetScalarFieldEnum[]
  }

  /**
   * MediaAsset findMany
   */
  export type MediaAssetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaAsset
     */
    select?: MediaAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MediaAssetInclude<ExtArgs> | null
    /**
     * Filter, which MediaAssets to fetch.
     */
    where?: MediaAssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MediaAssets to fetch.
     */
    orderBy?: MediaAssetOrderByWithRelationInput | MediaAssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MediaAssets.
     */
    cursor?: MediaAssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MediaAssets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MediaAssets.
     */
    skip?: number
    distinct?: MediaAssetScalarFieldEnum | MediaAssetScalarFieldEnum[]
  }

  /**
   * MediaAsset create
   */
  export type MediaAssetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaAsset
     */
    select?: MediaAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MediaAssetInclude<ExtArgs> | null
    /**
     * The data needed to create a MediaAsset.
     */
    data: XOR<MediaAssetCreateInput, MediaAssetUncheckedCreateInput>
  }

  /**
   * MediaAsset createMany
   */
  export type MediaAssetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MediaAssets.
     */
    data: MediaAssetCreateManyInput | MediaAssetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MediaAsset createManyAndReturn
   */
  export type MediaAssetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaAsset
     */
    select?: MediaAssetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MediaAssets.
     */
    data: MediaAssetCreateManyInput | MediaAssetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MediaAsset update
   */
  export type MediaAssetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaAsset
     */
    select?: MediaAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MediaAssetInclude<ExtArgs> | null
    /**
     * The data needed to update a MediaAsset.
     */
    data: XOR<MediaAssetUpdateInput, MediaAssetUncheckedUpdateInput>
    /**
     * Choose, which MediaAsset to update.
     */
    where: MediaAssetWhereUniqueInput
  }

  /**
   * MediaAsset updateMany
   */
  export type MediaAssetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MediaAssets.
     */
    data: XOR<MediaAssetUpdateManyMutationInput, MediaAssetUncheckedUpdateManyInput>
    /**
     * Filter which MediaAssets to update
     */
    where?: MediaAssetWhereInput
  }

  /**
   * MediaAsset upsert
   */
  export type MediaAssetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaAsset
     */
    select?: MediaAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MediaAssetInclude<ExtArgs> | null
    /**
     * The filter to search for the MediaAsset to update in case it exists.
     */
    where: MediaAssetWhereUniqueInput
    /**
     * In case the MediaAsset found by the `where` argument doesn't exist, create a new MediaAsset with this data.
     */
    create: XOR<MediaAssetCreateInput, MediaAssetUncheckedCreateInput>
    /**
     * In case the MediaAsset was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MediaAssetUpdateInput, MediaAssetUncheckedUpdateInput>
  }

  /**
   * MediaAsset delete
   */
  export type MediaAssetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaAsset
     */
    select?: MediaAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MediaAssetInclude<ExtArgs> | null
    /**
     * Filter which MediaAsset to delete.
     */
    where: MediaAssetWhereUniqueInput
  }

  /**
   * MediaAsset deleteMany
   */
  export type MediaAssetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MediaAssets to delete
     */
    where?: MediaAssetWhereInput
  }

  /**
   * MediaAsset.thumbnails
   */
  export type MediaAsset$thumbnailsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thumbnail
     */
    select?: ThumbnailSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThumbnailInclude<ExtArgs> | null
    where?: ThumbnailWhereInput
    orderBy?: ThumbnailOrderByWithRelationInput | ThumbnailOrderByWithRelationInput[]
    cursor?: ThumbnailWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ThumbnailScalarFieldEnum | ThumbnailScalarFieldEnum[]
  }

  /**
   * MediaAsset without action
   */
  export type MediaAssetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaAsset
     */
    select?: MediaAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MediaAssetInclude<ExtArgs> | null
  }


  /**
   * Model Thumbnail
   */

  export type AggregateThumbnail = {
    _count: ThumbnailCountAggregateOutputType | null
    _avg: ThumbnailAvgAggregateOutputType | null
    _sum: ThumbnailSumAggregateOutputType | null
    _min: ThumbnailMinAggregateOutputType | null
    _max: ThumbnailMaxAggregateOutputType | null
  }

  export type ThumbnailAvgAggregateOutputType = {
    width: number | null
    height: number | null
  }

  export type ThumbnailSumAggregateOutputType = {
    width: number | null
    height: number | null
  }

  export type ThumbnailMinAggregateOutputType = {
    id: string | null
    mediaAssetId: string | null
    variant: $Enums.ThumbnailVariant | null
    s3Key: string | null
    width: number | null
    height: number | null
    createdAt: Date | null
  }

  export type ThumbnailMaxAggregateOutputType = {
    id: string | null
    mediaAssetId: string | null
    variant: $Enums.ThumbnailVariant | null
    s3Key: string | null
    width: number | null
    height: number | null
    createdAt: Date | null
  }

  export type ThumbnailCountAggregateOutputType = {
    id: number
    mediaAssetId: number
    variant: number
    s3Key: number
    width: number
    height: number
    createdAt: number
    _all: number
  }


  export type ThumbnailAvgAggregateInputType = {
    width?: true
    height?: true
  }

  export type ThumbnailSumAggregateInputType = {
    width?: true
    height?: true
  }

  export type ThumbnailMinAggregateInputType = {
    id?: true
    mediaAssetId?: true
    variant?: true
    s3Key?: true
    width?: true
    height?: true
    createdAt?: true
  }

  export type ThumbnailMaxAggregateInputType = {
    id?: true
    mediaAssetId?: true
    variant?: true
    s3Key?: true
    width?: true
    height?: true
    createdAt?: true
  }

  export type ThumbnailCountAggregateInputType = {
    id?: true
    mediaAssetId?: true
    variant?: true
    s3Key?: true
    width?: true
    height?: true
    createdAt?: true
    _all?: true
  }

  export type ThumbnailAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Thumbnail to aggregate.
     */
    where?: ThumbnailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Thumbnails to fetch.
     */
    orderBy?: ThumbnailOrderByWithRelationInput | ThumbnailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ThumbnailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Thumbnails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Thumbnails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Thumbnails
    **/
    _count?: true | ThumbnailCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ThumbnailAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ThumbnailSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ThumbnailMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ThumbnailMaxAggregateInputType
  }

  export type GetThumbnailAggregateType<T extends ThumbnailAggregateArgs> = {
        [P in keyof T & keyof AggregateThumbnail]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateThumbnail[P]>
      : GetScalarType<T[P], AggregateThumbnail[P]>
  }




  export type ThumbnailGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ThumbnailWhereInput
    orderBy?: ThumbnailOrderByWithAggregationInput | ThumbnailOrderByWithAggregationInput[]
    by: ThumbnailScalarFieldEnum[] | ThumbnailScalarFieldEnum
    having?: ThumbnailScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ThumbnailCountAggregateInputType | true
    _avg?: ThumbnailAvgAggregateInputType
    _sum?: ThumbnailSumAggregateInputType
    _min?: ThumbnailMinAggregateInputType
    _max?: ThumbnailMaxAggregateInputType
  }

  export type ThumbnailGroupByOutputType = {
    id: string
    mediaAssetId: string
    variant: $Enums.ThumbnailVariant
    s3Key: string
    width: number
    height: number
    createdAt: Date
    _count: ThumbnailCountAggregateOutputType | null
    _avg: ThumbnailAvgAggregateOutputType | null
    _sum: ThumbnailSumAggregateOutputType | null
    _min: ThumbnailMinAggregateOutputType | null
    _max: ThumbnailMaxAggregateOutputType | null
  }

  type GetThumbnailGroupByPayload<T extends ThumbnailGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ThumbnailGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ThumbnailGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ThumbnailGroupByOutputType[P]>
            : GetScalarType<T[P], ThumbnailGroupByOutputType[P]>
        }
      >
    >


  export type ThumbnailSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mediaAssetId?: boolean
    variant?: boolean
    s3Key?: boolean
    width?: boolean
    height?: boolean
    createdAt?: boolean
    asset?: boolean | MediaAssetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["thumbnail"]>

  export type ThumbnailSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mediaAssetId?: boolean
    variant?: boolean
    s3Key?: boolean
    width?: boolean
    height?: boolean
    createdAt?: boolean
    asset?: boolean | MediaAssetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["thumbnail"]>

  export type ThumbnailSelectScalar = {
    id?: boolean
    mediaAssetId?: boolean
    variant?: boolean
    s3Key?: boolean
    width?: boolean
    height?: boolean
    createdAt?: boolean
  }

  export type ThumbnailInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | MediaAssetDefaultArgs<ExtArgs>
  }
  export type ThumbnailIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | MediaAssetDefaultArgs<ExtArgs>
  }

  export type $ThumbnailPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Thumbnail"
    objects: {
      asset: Prisma.$MediaAssetPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      mediaAssetId: string
      variant: $Enums.ThumbnailVariant
      s3Key: string
      width: number
      height: number
      createdAt: Date
    }, ExtArgs["result"]["thumbnail"]>
    composites: {}
  }

  type ThumbnailGetPayload<S extends boolean | null | undefined | ThumbnailDefaultArgs> = $Result.GetResult<Prisma.$ThumbnailPayload, S>

  type ThumbnailCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ThumbnailFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ThumbnailCountAggregateInputType | true
    }

  export interface ThumbnailDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Thumbnail'], meta: { name: 'Thumbnail' } }
    /**
     * Find zero or one Thumbnail that matches the filter.
     * @param {ThumbnailFindUniqueArgs} args - Arguments to find a Thumbnail
     * @example
     * // Get one Thumbnail
     * const thumbnail = await prisma.thumbnail.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ThumbnailFindUniqueArgs>(args: SelectSubset<T, ThumbnailFindUniqueArgs<ExtArgs>>): Prisma__ThumbnailClient<$Result.GetResult<Prisma.$ThumbnailPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Thumbnail that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ThumbnailFindUniqueOrThrowArgs} args - Arguments to find a Thumbnail
     * @example
     * // Get one Thumbnail
     * const thumbnail = await prisma.thumbnail.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ThumbnailFindUniqueOrThrowArgs>(args: SelectSubset<T, ThumbnailFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ThumbnailClient<$Result.GetResult<Prisma.$ThumbnailPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Thumbnail that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThumbnailFindFirstArgs} args - Arguments to find a Thumbnail
     * @example
     * // Get one Thumbnail
     * const thumbnail = await prisma.thumbnail.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ThumbnailFindFirstArgs>(args?: SelectSubset<T, ThumbnailFindFirstArgs<ExtArgs>>): Prisma__ThumbnailClient<$Result.GetResult<Prisma.$ThumbnailPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Thumbnail that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThumbnailFindFirstOrThrowArgs} args - Arguments to find a Thumbnail
     * @example
     * // Get one Thumbnail
     * const thumbnail = await prisma.thumbnail.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ThumbnailFindFirstOrThrowArgs>(args?: SelectSubset<T, ThumbnailFindFirstOrThrowArgs<ExtArgs>>): Prisma__ThumbnailClient<$Result.GetResult<Prisma.$ThumbnailPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Thumbnails that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThumbnailFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Thumbnails
     * const thumbnails = await prisma.thumbnail.findMany()
     * 
     * // Get first 10 Thumbnails
     * const thumbnails = await prisma.thumbnail.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const thumbnailWithIdOnly = await prisma.thumbnail.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ThumbnailFindManyArgs>(args?: SelectSubset<T, ThumbnailFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ThumbnailPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Thumbnail.
     * @param {ThumbnailCreateArgs} args - Arguments to create a Thumbnail.
     * @example
     * // Create one Thumbnail
     * const Thumbnail = await prisma.thumbnail.create({
     *   data: {
     *     // ... data to create a Thumbnail
     *   }
     * })
     * 
     */
    create<T extends ThumbnailCreateArgs>(args: SelectSubset<T, ThumbnailCreateArgs<ExtArgs>>): Prisma__ThumbnailClient<$Result.GetResult<Prisma.$ThumbnailPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Thumbnails.
     * @param {ThumbnailCreateManyArgs} args - Arguments to create many Thumbnails.
     * @example
     * // Create many Thumbnails
     * const thumbnail = await prisma.thumbnail.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ThumbnailCreateManyArgs>(args?: SelectSubset<T, ThumbnailCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Thumbnails and returns the data saved in the database.
     * @param {ThumbnailCreateManyAndReturnArgs} args - Arguments to create many Thumbnails.
     * @example
     * // Create many Thumbnails
     * const thumbnail = await prisma.thumbnail.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Thumbnails and only return the `id`
     * const thumbnailWithIdOnly = await prisma.thumbnail.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ThumbnailCreateManyAndReturnArgs>(args?: SelectSubset<T, ThumbnailCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ThumbnailPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Thumbnail.
     * @param {ThumbnailDeleteArgs} args - Arguments to delete one Thumbnail.
     * @example
     * // Delete one Thumbnail
     * const Thumbnail = await prisma.thumbnail.delete({
     *   where: {
     *     // ... filter to delete one Thumbnail
     *   }
     * })
     * 
     */
    delete<T extends ThumbnailDeleteArgs>(args: SelectSubset<T, ThumbnailDeleteArgs<ExtArgs>>): Prisma__ThumbnailClient<$Result.GetResult<Prisma.$ThumbnailPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Thumbnail.
     * @param {ThumbnailUpdateArgs} args - Arguments to update one Thumbnail.
     * @example
     * // Update one Thumbnail
     * const thumbnail = await prisma.thumbnail.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ThumbnailUpdateArgs>(args: SelectSubset<T, ThumbnailUpdateArgs<ExtArgs>>): Prisma__ThumbnailClient<$Result.GetResult<Prisma.$ThumbnailPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Thumbnails.
     * @param {ThumbnailDeleteManyArgs} args - Arguments to filter Thumbnails to delete.
     * @example
     * // Delete a few Thumbnails
     * const { count } = await prisma.thumbnail.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ThumbnailDeleteManyArgs>(args?: SelectSubset<T, ThumbnailDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Thumbnails.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThumbnailUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Thumbnails
     * const thumbnail = await prisma.thumbnail.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ThumbnailUpdateManyArgs>(args: SelectSubset<T, ThumbnailUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Thumbnail.
     * @param {ThumbnailUpsertArgs} args - Arguments to update or create a Thumbnail.
     * @example
     * // Update or create a Thumbnail
     * const thumbnail = await prisma.thumbnail.upsert({
     *   create: {
     *     // ... data to create a Thumbnail
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Thumbnail we want to update
     *   }
     * })
     */
    upsert<T extends ThumbnailUpsertArgs>(args: SelectSubset<T, ThumbnailUpsertArgs<ExtArgs>>): Prisma__ThumbnailClient<$Result.GetResult<Prisma.$ThumbnailPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Thumbnails.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThumbnailCountArgs} args - Arguments to filter Thumbnails to count.
     * @example
     * // Count the number of Thumbnails
     * const count = await prisma.thumbnail.count({
     *   where: {
     *     // ... the filter for the Thumbnails we want to count
     *   }
     * })
    **/
    count<T extends ThumbnailCountArgs>(
      args?: Subset<T, ThumbnailCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ThumbnailCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Thumbnail.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThumbnailAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ThumbnailAggregateArgs>(args: Subset<T, ThumbnailAggregateArgs>): Prisma.PrismaPromise<GetThumbnailAggregateType<T>>

    /**
     * Group by Thumbnail.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThumbnailGroupByArgs} args - Group by arguments.
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
      T extends ThumbnailGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ThumbnailGroupByArgs['orderBy'] }
        : { orderBy?: ThumbnailGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ThumbnailGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetThumbnailGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Thumbnail model
   */
  readonly fields: ThumbnailFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Thumbnail.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ThumbnailClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    asset<T extends MediaAssetDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MediaAssetDefaultArgs<ExtArgs>>): Prisma__MediaAssetClient<$Result.GetResult<Prisma.$MediaAssetPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the Thumbnail model
   */ 
  interface ThumbnailFieldRefs {
    readonly id: FieldRef<"Thumbnail", 'String'>
    readonly mediaAssetId: FieldRef<"Thumbnail", 'String'>
    readonly variant: FieldRef<"Thumbnail", 'ThumbnailVariant'>
    readonly s3Key: FieldRef<"Thumbnail", 'String'>
    readonly width: FieldRef<"Thumbnail", 'Int'>
    readonly height: FieldRef<"Thumbnail", 'Int'>
    readonly createdAt: FieldRef<"Thumbnail", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Thumbnail findUnique
   */
  export type ThumbnailFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thumbnail
     */
    select?: ThumbnailSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThumbnailInclude<ExtArgs> | null
    /**
     * Filter, which Thumbnail to fetch.
     */
    where: ThumbnailWhereUniqueInput
  }

  /**
   * Thumbnail findUniqueOrThrow
   */
  export type ThumbnailFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thumbnail
     */
    select?: ThumbnailSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThumbnailInclude<ExtArgs> | null
    /**
     * Filter, which Thumbnail to fetch.
     */
    where: ThumbnailWhereUniqueInput
  }

  /**
   * Thumbnail findFirst
   */
  export type ThumbnailFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thumbnail
     */
    select?: ThumbnailSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThumbnailInclude<ExtArgs> | null
    /**
     * Filter, which Thumbnail to fetch.
     */
    where?: ThumbnailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Thumbnails to fetch.
     */
    orderBy?: ThumbnailOrderByWithRelationInput | ThumbnailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Thumbnails.
     */
    cursor?: ThumbnailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Thumbnails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Thumbnails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Thumbnails.
     */
    distinct?: ThumbnailScalarFieldEnum | ThumbnailScalarFieldEnum[]
  }

  /**
   * Thumbnail findFirstOrThrow
   */
  export type ThumbnailFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thumbnail
     */
    select?: ThumbnailSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThumbnailInclude<ExtArgs> | null
    /**
     * Filter, which Thumbnail to fetch.
     */
    where?: ThumbnailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Thumbnails to fetch.
     */
    orderBy?: ThumbnailOrderByWithRelationInput | ThumbnailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Thumbnails.
     */
    cursor?: ThumbnailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Thumbnails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Thumbnails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Thumbnails.
     */
    distinct?: ThumbnailScalarFieldEnum | ThumbnailScalarFieldEnum[]
  }

  /**
   * Thumbnail findMany
   */
  export type ThumbnailFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thumbnail
     */
    select?: ThumbnailSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThumbnailInclude<ExtArgs> | null
    /**
     * Filter, which Thumbnails to fetch.
     */
    where?: ThumbnailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Thumbnails to fetch.
     */
    orderBy?: ThumbnailOrderByWithRelationInput | ThumbnailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Thumbnails.
     */
    cursor?: ThumbnailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Thumbnails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Thumbnails.
     */
    skip?: number
    distinct?: ThumbnailScalarFieldEnum | ThumbnailScalarFieldEnum[]
  }

  /**
   * Thumbnail create
   */
  export type ThumbnailCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thumbnail
     */
    select?: ThumbnailSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThumbnailInclude<ExtArgs> | null
    /**
     * The data needed to create a Thumbnail.
     */
    data: XOR<ThumbnailCreateInput, ThumbnailUncheckedCreateInput>
  }

  /**
   * Thumbnail createMany
   */
  export type ThumbnailCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Thumbnails.
     */
    data: ThumbnailCreateManyInput | ThumbnailCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Thumbnail createManyAndReturn
   */
  export type ThumbnailCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thumbnail
     */
    select?: ThumbnailSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Thumbnails.
     */
    data: ThumbnailCreateManyInput | ThumbnailCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThumbnailIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Thumbnail update
   */
  export type ThumbnailUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thumbnail
     */
    select?: ThumbnailSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThumbnailInclude<ExtArgs> | null
    /**
     * The data needed to update a Thumbnail.
     */
    data: XOR<ThumbnailUpdateInput, ThumbnailUncheckedUpdateInput>
    /**
     * Choose, which Thumbnail to update.
     */
    where: ThumbnailWhereUniqueInput
  }

  /**
   * Thumbnail updateMany
   */
  export type ThumbnailUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Thumbnails.
     */
    data: XOR<ThumbnailUpdateManyMutationInput, ThumbnailUncheckedUpdateManyInput>
    /**
     * Filter which Thumbnails to update
     */
    where?: ThumbnailWhereInput
  }

  /**
   * Thumbnail upsert
   */
  export type ThumbnailUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thumbnail
     */
    select?: ThumbnailSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThumbnailInclude<ExtArgs> | null
    /**
     * The filter to search for the Thumbnail to update in case it exists.
     */
    where: ThumbnailWhereUniqueInput
    /**
     * In case the Thumbnail found by the `where` argument doesn't exist, create a new Thumbnail with this data.
     */
    create: XOR<ThumbnailCreateInput, ThumbnailUncheckedCreateInput>
    /**
     * In case the Thumbnail was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ThumbnailUpdateInput, ThumbnailUncheckedUpdateInput>
  }

  /**
   * Thumbnail delete
   */
  export type ThumbnailDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thumbnail
     */
    select?: ThumbnailSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThumbnailInclude<ExtArgs> | null
    /**
     * Filter which Thumbnail to delete.
     */
    where: ThumbnailWhereUniqueInput
  }

  /**
   * Thumbnail deleteMany
   */
  export type ThumbnailDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Thumbnails to delete
     */
    where?: ThumbnailWhereInput
  }

  /**
   * Thumbnail without action
   */
  export type ThumbnailDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thumbnail
     */
    select?: ThumbnailSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThumbnailInclude<ExtArgs> | null
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


  export const MediaAssetScalarFieldEnum: {
    id: 'id',
    s3Key: 's3Key',
    contentType: 'contentType',
    sizeBytes: 'sizeBytes',
    width: 'width',
    height: 'height',
    status: 'status',
    uploadedBy: 'uploadedBy',
    altText: 'altText',
    failureReason: 'failureReason',
    retryCount: 'retryCount',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    confirmedAt: 'confirmedAt',
    readyAt: 'readyAt'
  };

  export type MediaAssetScalarFieldEnum = (typeof MediaAssetScalarFieldEnum)[keyof typeof MediaAssetScalarFieldEnum]


  export const ThumbnailScalarFieldEnum: {
    id: 'id',
    mediaAssetId: 'mediaAssetId',
    variant: 'variant',
    s3Key: 's3Key',
    width: 'width',
    height: 'height',
    createdAt: 'createdAt'
  };

  export type ThumbnailScalarFieldEnum = (typeof ThumbnailScalarFieldEnum)[keyof typeof ThumbnailScalarFieldEnum]


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
   * Reference to a field of type 'MediaStatus'
   */
  export type EnumMediaStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MediaStatus'>
    


  /**
   * Reference to a field of type 'MediaStatus[]'
   */
  export type ListEnumMediaStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MediaStatus[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'ThumbnailVariant'
   */
  export type EnumThumbnailVariantFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ThumbnailVariant'>
    


  /**
   * Reference to a field of type 'ThumbnailVariant[]'
   */
  export type ListEnumThumbnailVariantFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ThumbnailVariant[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


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


  export type MediaAssetWhereInput = {
    AND?: MediaAssetWhereInput | MediaAssetWhereInput[]
    OR?: MediaAssetWhereInput[]
    NOT?: MediaAssetWhereInput | MediaAssetWhereInput[]
    id?: UuidFilter<"MediaAsset"> | string
    s3Key?: StringFilter<"MediaAsset"> | string
    contentType?: StringFilter<"MediaAsset"> | string
    sizeBytes?: IntFilter<"MediaAsset"> | number
    width?: IntNullableFilter<"MediaAsset"> | number | null
    height?: IntNullableFilter<"MediaAsset"> | number | null
    status?: EnumMediaStatusFilter<"MediaAsset"> | $Enums.MediaStatus
    uploadedBy?: UuidFilter<"MediaAsset"> | string
    altText?: StringNullableFilter<"MediaAsset"> | string | null
    failureReason?: StringNullableFilter<"MediaAsset"> | string | null
    retryCount?: IntFilter<"MediaAsset"> | number
    createdAt?: DateTimeFilter<"MediaAsset"> | Date | string
    updatedAt?: DateTimeFilter<"MediaAsset"> | Date | string
    confirmedAt?: DateTimeNullableFilter<"MediaAsset"> | Date | string | null
    readyAt?: DateTimeNullableFilter<"MediaAsset"> | Date | string | null
    thumbnails?: ThumbnailListRelationFilter
  }

  export type MediaAssetOrderByWithRelationInput = {
    id?: SortOrder
    s3Key?: SortOrder
    contentType?: SortOrder
    sizeBytes?: SortOrder
    width?: SortOrderInput | SortOrder
    height?: SortOrderInput | SortOrder
    status?: SortOrder
    uploadedBy?: SortOrder
    altText?: SortOrderInput | SortOrder
    failureReason?: SortOrderInput | SortOrder
    retryCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    confirmedAt?: SortOrderInput | SortOrder
    readyAt?: SortOrderInput | SortOrder
    thumbnails?: ThumbnailOrderByRelationAggregateInput
  }

  export type MediaAssetWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    s3Key?: string
    AND?: MediaAssetWhereInput | MediaAssetWhereInput[]
    OR?: MediaAssetWhereInput[]
    NOT?: MediaAssetWhereInput | MediaAssetWhereInput[]
    contentType?: StringFilter<"MediaAsset"> | string
    sizeBytes?: IntFilter<"MediaAsset"> | number
    width?: IntNullableFilter<"MediaAsset"> | number | null
    height?: IntNullableFilter<"MediaAsset"> | number | null
    status?: EnumMediaStatusFilter<"MediaAsset"> | $Enums.MediaStatus
    uploadedBy?: UuidFilter<"MediaAsset"> | string
    altText?: StringNullableFilter<"MediaAsset"> | string | null
    failureReason?: StringNullableFilter<"MediaAsset"> | string | null
    retryCount?: IntFilter<"MediaAsset"> | number
    createdAt?: DateTimeFilter<"MediaAsset"> | Date | string
    updatedAt?: DateTimeFilter<"MediaAsset"> | Date | string
    confirmedAt?: DateTimeNullableFilter<"MediaAsset"> | Date | string | null
    readyAt?: DateTimeNullableFilter<"MediaAsset"> | Date | string | null
    thumbnails?: ThumbnailListRelationFilter
  }, "id" | "s3Key">

  export type MediaAssetOrderByWithAggregationInput = {
    id?: SortOrder
    s3Key?: SortOrder
    contentType?: SortOrder
    sizeBytes?: SortOrder
    width?: SortOrderInput | SortOrder
    height?: SortOrderInput | SortOrder
    status?: SortOrder
    uploadedBy?: SortOrder
    altText?: SortOrderInput | SortOrder
    failureReason?: SortOrderInput | SortOrder
    retryCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    confirmedAt?: SortOrderInput | SortOrder
    readyAt?: SortOrderInput | SortOrder
    _count?: MediaAssetCountOrderByAggregateInput
    _avg?: MediaAssetAvgOrderByAggregateInput
    _max?: MediaAssetMaxOrderByAggregateInput
    _min?: MediaAssetMinOrderByAggregateInput
    _sum?: MediaAssetSumOrderByAggregateInput
  }

  export type MediaAssetScalarWhereWithAggregatesInput = {
    AND?: MediaAssetScalarWhereWithAggregatesInput | MediaAssetScalarWhereWithAggregatesInput[]
    OR?: MediaAssetScalarWhereWithAggregatesInput[]
    NOT?: MediaAssetScalarWhereWithAggregatesInput | MediaAssetScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"MediaAsset"> | string
    s3Key?: StringWithAggregatesFilter<"MediaAsset"> | string
    contentType?: StringWithAggregatesFilter<"MediaAsset"> | string
    sizeBytes?: IntWithAggregatesFilter<"MediaAsset"> | number
    width?: IntNullableWithAggregatesFilter<"MediaAsset"> | number | null
    height?: IntNullableWithAggregatesFilter<"MediaAsset"> | number | null
    status?: EnumMediaStatusWithAggregatesFilter<"MediaAsset"> | $Enums.MediaStatus
    uploadedBy?: UuidWithAggregatesFilter<"MediaAsset"> | string
    altText?: StringNullableWithAggregatesFilter<"MediaAsset"> | string | null
    failureReason?: StringNullableWithAggregatesFilter<"MediaAsset"> | string | null
    retryCount?: IntWithAggregatesFilter<"MediaAsset"> | number
    createdAt?: DateTimeWithAggregatesFilter<"MediaAsset"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MediaAsset"> | Date | string
    confirmedAt?: DateTimeNullableWithAggregatesFilter<"MediaAsset"> | Date | string | null
    readyAt?: DateTimeNullableWithAggregatesFilter<"MediaAsset"> | Date | string | null
  }

  export type ThumbnailWhereInput = {
    AND?: ThumbnailWhereInput | ThumbnailWhereInput[]
    OR?: ThumbnailWhereInput[]
    NOT?: ThumbnailWhereInput | ThumbnailWhereInput[]
    id?: UuidFilter<"Thumbnail"> | string
    mediaAssetId?: UuidFilter<"Thumbnail"> | string
    variant?: EnumThumbnailVariantFilter<"Thumbnail"> | $Enums.ThumbnailVariant
    s3Key?: StringFilter<"Thumbnail"> | string
    width?: IntFilter<"Thumbnail"> | number
    height?: IntFilter<"Thumbnail"> | number
    createdAt?: DateTimeFilter<"Thumbnail"> | Date | string
    asset?: XOR<MediaAssetRelationFilter, MediaAssetWhereInput>
  }

  export type ThumbnailOrderByWithRelationInput = {
    id?: SortOrder
    mediaAssetId?: SortOrder
    variant?: SortOrder
    s3Key?: SortOrder
    width?: SortOrder
    height?: SortOrder
    createdAt?: SortOrder
    asset?: MediaAssetOrderByWithRelationInput
  }

  export type ThumbnailWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    mediaAssetId_variant?: ThumbnailMediaAssetIdVariantCompoundUniqueInput
    AND?: ThumbnailWhereInput | ThumbnailWhereInput[]
    OR?: ThumbnailWhereInput[]
    NOT?: ThumbnailWhereInput | ThumbnailWhereInput[]
    mediaAssetId?: UuidFilter<"Thumbnail"> | string
    variant?: EnumThumbnailVariantFilter<"Thumbnail"> | $Enums.ThumbnailVariant
    s3Key?: StringFilter<"Thumbnail"> | string
    width?: IntFilter<"Thumbnail"> | number
    height?: IntFilter<"Thumbnail"> | number
    createdAt?: DateTimeFilter<"Thumbnail"> | Date | string
    asset?: XOR<MediaAssetRelationFilter, MediaAssetWhereInput>
  }, "id" | "mediaAssetId_variant">

  export type ThumbnailOrderByWithAggregationInput = {
    id?: SortOrder
    mediaAssetId?: SortOrder
    variant?: SortOrder
    s3Key?: SortOrder
    width?: SortOrder
    height?: SortOrder
    createdAt?: SortOrder
    _count?: ThumbnailCountOrderByAggregateInput
    _avg?: ThumbnailAvgOrderByAggregateInput
    _max?: ThumbnailMaxOrderByAggregateInput
    _min?: ThumbnailMinOrderByAggregateInput
    _sum?: ThumbnailSumOrderByAggregateInput
  }

  export type ThumbnailScalarWhereWithAggregatesInput = {
    AND?: ThumbnailScalarWhereWithAggregatesInput | ThumbnailScalarWhereWithAggregatesInput[]
    OR?: ThumbnailScalarWhereWithAggregatesInput[]
    NOT?: ThumbnailScalarWhereWithAggregatesInput | ThumbnailScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Thumbnail"> | string
    mediaAssetId?: UuidWithAggregatesFilter<"Thumbnail"> | string
    variant?: EnumThumbnailVariantWithAggregatesFilter<"Thumbnail"> | $Enums.ThumbnailVariant
    s3Key?: StringWithAggregatesFilter<"Thumbnail"> | string
    width?: IntWithAggregatesFilter<"Thumbnail"> | number
    height?: IntWithAggregatesFilter<"Thumbnail"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Thumbnail"> | Date | string
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

  export type MediaAssetCreateInput = {
    id: string
    s3Key: string
    contentType: string
    sizeBytes: number
    width?: number | null
    height?: number | null
    status?: $Enums.MediaStatus
    uploadedBy: string
    altText?: string | null
    failureReason?: string | null
    retryCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    confirmedAt?: Date | string | null
    readyAt?: Date | string | null
    thumbnails?: ThumbnailCreateNestedManyWithoutAssetInput
  }

  export type MediaAssetUncheckedCreateInput = {
    id: string
    s3Key: string
    contentType: string
    sizeBytes: number
    width?: number | null
    height?: number | null
    status?: $Enums.MediaStatus
    uploadedBy: string
    altText?: string | null
    failureReason?: string | null
    retryCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    confirmedAt?: Date | string | null
    readyAt?: Date | string | null
    thumbnails?: ThumbnailUncheckedCreateNestedManyWithoutAssetInput
  }

  export type MediaAssetUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    s3Key?: StringFieldUpdateOperationsInput | string
    contentType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumMediaStatusFieldUpdateOperationsInput | $Enums.MediaStatus
    uploadedBy?: StringFieldUpdateOperationsInput | string
    altText?: NullableStringFieldUpdateOperationsInput | string | null
    failureReason?: NullableStringFieldUpdateOperationsInput | string | null
    retryCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    readyAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    thumbnails?: ThumbnailUpdateManyWithoutAssetNestedInput
  }

  export type MediaAssetUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    s3Key?: StringFieldUpdateOperationsInput | string
    contentType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumMediaStatusFieldUpdateOperationsInput | $Enums.MediaStatus
    uploadedBy?: StringFieldUpdateOperationsInput | string
    altText?: NullableStringFieldUpdateOperationsInput | string | null
    failureReason?: NullableStringFieldUpdateOperationsInput | string | null
    retryCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    readyAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    thumbnails?: ThumbnailUncheckedUpdateManyWithoutAssetNestedInput
  }

  export type MediaAssetCreateManyInput = {
    id: string
    s3Key: string
    contentType: string
    sizeBytes: number
    width?: number | null
    height?: number | null
    status?: $Enums.MediaStatus
    uploadedBy: string
    altText?: string | null
    failureReason?: string | null
    retryCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    confirmedAt?: Date | string | null
    readyAt?: Date | string | null
  }

  export type MediaAssetUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    s3Key?: StringFieldUpdateOperationsInput | string
    contentType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumMediaStatusFieldUpdateOperationsInput | $Enums.MediaStatus
    uploadedBy?: StringFieldUpdateOperationsInput | string
    altText?: NullableStringFieldUpdateOperationsInput | string | null
    failureReason?: NullableStringFieldUpdateOperationsInput | string | null
    retryCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    readyAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MediaAssetUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    s3Key?: StringFieldUpdateOperationsInput | string
    contentType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumMediaStatusFieldUpdateOperationsInput | $Enums.MediaStatus
    uploadedBy?: StringFieldUpdateOperationsInput | string
    altText?: NullableStringFieldUpdateOperationsInput | string | null
    failureReason?: NullableStringFieldUpdateOperationsInput | string | null
    retryCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    readyAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ThumbnailCreateInput = {
    id: string
    variant: $Enums.ThumbnailVariant
    s3Key: string
    width: number
    height: number
    createdAt?: Date | string
    asset: MediaAssetCreateNestedOneWithoutThumbnailsInput
  }

  export type ThumbnailUncheckedCreateInput = {
    id: string
    mediaAssetId: string
    variant: $Enums.ThumbnailVariant
    s3Key: string
    width: number
    height: number
    createdAt?: Date | string
  }

  export type ThumbnailUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    variant?: EnumThumbnailVariantFieldUpdateOperationsInput | $Enums.ThumbnailVariant
    s3Key?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: MediaAssetUpdateOneRequiredWithoutThumbnailsNestedInput
  }

  export type ThumbnailUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    mediaAssetId?: StringFieldUpdateOperationsInput | string
    variant?: EnumThumbnailVariantFieldUpdateOperationsInput | $Enums.ThumbnailVariant
    s3Key?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ThumbnailCreateManyInput = {
    id: string
    mediaAssetId: string
    variant: $Enums.ThumbnailVariant
    s3Key: string
    width: number
    height: number
    createdAt?: Date | string
  }

  export type ThumbnailUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    variant?: EnumThumbnailVariantFieldUpdateOperationsInput | $Enums.ThumbnailVariant
    s3Key?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ThumbnailUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    mediaAssetId?: StringFieldUpdateOperationsInput | string
    variant?: EnumThumbnailVariantFieldUpdateOperationsInput | $Enums.ThumbnailVariant
    s3Key?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type EnumMediaStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MediaStatus | EnumMediaStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MediaStatus[] | ListEnumMediaStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MediaStatus[] | ListEnumMediaStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMediaStatusFilter<$PrismaModel> | $Enums.MediaStatus
  }

  export type StringNullableFilter<$PrismaModel = never> = {
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
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
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

  export type ThumbnailListRelationFilter = {
    every?: ThumbnailWhereInput
    some?: ThumbnailWhereInput
    none?: ThumbnailWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ThumbnailOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MediaAssetCountOrderByAggregateInput = {
    id?: SortOrder
    s3Key?: SortOrder
    contentType?: SortOrder
    sizeBytes?: SortOrder
    width?: SortOrder
    height?: SortOrder
    status?: SortOrder
    uploadedBy?: SortOrder
    altText?: SortOrder
    failureReason?: SortOrder
    retryCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    confirmedAt?: SortOrder
    readyAt?: SortOrder
  }

  export type MediaAssetAvgOrderByAggregateInput = {
    sizeBytes?: SortOrder
    width?: SortOrder
    height?: SortOrder
    retryCount?: SortOrder
  }

  export type MediaAssetMaxOrderByAggregateInput = {
    id?: SortOrder
    s3Key?: SortOrder
    contentType?: SortOrder
    sizeBytes?: SortOrder
    width?: SortOrder
    height?: SortOrder
    status?: SortOrder
    uploadedBy?: SortOrder
    altText?: SortOrder
    failureReason?: SortOrder
    retryCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    confirmedAt?: SortOrder
    readyAt?: SortOrder
  }

  export type MediaAssetMinOrderByAggregateInput = {
    id?: SortOrder
    s3Key?: SortOrder
    contentType?: SortOrder
    sizeBytes?: SortOrder
    width?: SortOrder
    height?: SortOrder
    status?: SortOrder
    uploadedBy?: SortOrder
    altText?: SortOrder
    failureReason?: SortOrder
    retryCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    confirmedAt?: SortOrder
    readyAt?: SortOrder
  }

  export type MediaAssetSumOrderByAggregateInput = {
    sizeBytes?: SortOrder
    width?: SortOrder
    height?: SortOrder
    retryCount?: SortOrder
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

  export type EnumMediaStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MediaStatus | EnumMediaStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MediaStatus[] | ListEnumMediaStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MediaStatus[] | ListEnumMediaStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMediaStatusWithAggregatesFilter<$PrismaModel> | $Enums.MediaStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMediaStatusFilter<$PrismaModel>
    _max?: NestedEnumMediaStatusFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
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
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
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

  export type EnumThumbnailVariantFilter<$PrismaModel = never> = {
    equals?: $Enums.ThumbnailVariant | EnumThumbnailVariantFieldRefInput<$PrismaModel>
    in?: $Enums.ThumbnailVariant[] | ListEnumThumbnailVariantFieldRefInput<$PrismaModel>
    notIn?: $Enums.ThumbnailVariant[] | ListEnumThumbnailVariantFieldRefInput<$PrismaModel>
    not?: NestedEnumThumbnailVariantFilter<$PrismaModel> | $Enums.ThumbnailVariant
  }

  export type MediaAssetRelationFilter = {
    is?: MediaAssetWhereInput
    isNot?: MediaAssetWhereInput
  }

  export type ThumbnailMediaAssetIdVariantCompoundUniqueInput = {
    mediaAssetId: string
    variant: $Enums.ThumbnailVariant
  }

  export type ThumbnailCountOrderByAggregateInput = {
    id?: SortOrder
    mediaAssetId?: SortOrder
    variant?: SortOrder
    s3Key?: SortOrder
    width?: SortOrder
    height?: SortOrder
    createdAt?: SortOrder
  }

  export type ThumbnailAvgOrderByAggregateInput = {
    width?: SortOrder
    height?: SortOrder
  }

  export type ThumbnailMaxOrderByAggregateInput = {
    id?: SortOrder
    mediaAssetId?: SortOrder
    variant?: SortOrder
    s3Key?: SortOrder
    width?: SortOrder
    height?: SortOrder
    createdAt?: SortOrder
  }

  export type ThumbnailMinOrderByAggregateInput = {
    id?: SortOrder
    mediaAssetId?: SortOrder
    variant?: SortOrder
    s3Key?: SortOrder
    width?: SortOrder
    height?: SortOrder
    createdAt?: SortOrder
  }

  export type ThumbnailSumOrderByAggregateInput = {
    width?: SortOrder
    height?: SortOrder
  }

  export type EnumThumbnailVariantWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ThumbnailVariant | EnumThumbnailVariantFieldRefInput<$PrismaModel>
    in?: $Enums.ThumbnailVariant[] | ListEnumThumbnailVariantFieldRefInput<$PrismaModel>
    notIn?: $Enums.ThumbnailVariant[] | ListEnumThumbnailVariantFieldRefInput<$PrismaModel>
    not?: NestedEnumThumbnailVariantWithAggregatesFilter<$PrismaModel> | $Enums.ThumbnailVariant
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumThumbnailVariantFilter<$PrismaModel>
    _max?: NestedEnumThumbnailVariantFilter<$PrismaModel>
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

  export type ThumbnailCreateNestedManyWithoutAssetInput = {
    create?: XOR<ThumbnailCreateWithoutAssetInput, ThumbnailUncheckedCreateWithoutAssetInput> | ThumbnailCreateWithoutAssetInput[] | ThumbnailUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: ThumbnailCreateOrConnectWithoutAssetInput | ThumbnailCreateOrConnectWithoutAssetInput[]
    createMany?: ThumbnailCreateManyAssetInputEnvelope
    connect?: ThumbnailWhereUniqueInput | ThumbnailWhereUniqueInput[]
  }

  export type ThumbnailUncheckedCreateNestedManyWithoutAssetInput = {
    create?: XOR<ThumbnailCreateWithoutAssetInput, ThumbnailUncheckedCreateWithoutAssetInput> | ThumbnailCreateWithoutAssetInput[] | ThumbnailUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: ThumbnailCreateOrConnectWithoutAssetInput | ThumbnailCreateOrConnectWithoutAssetInput[]
    createMany?: ThumbnailCreateManyAssetInputEnvelope
    connect?: ThumbnailWhereUniqueInput | ThumbnailWhereUniqueInput[]
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

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumMediaStatusFieldUpdateOperationsInput = {
    set?: $Enums.MediaStatus
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ThumbnailUpdateManyWithoutAssetNestedInput = {
    create?: XOR<ThumbnailCreateWithoutAssetInput, ThumbnailUncheckedCreateWithoutAssetInput> | ThumbnailCreateWithoutAssetInput[] | ThumbnailUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: ThumbnailCreateOrConnectWithoutAssetInput | ThumbnailCreateOrConnectWithoutAssetInput[]
    upsert?: ThumbnailUpsertWithWhereUniqueWithoutAssetInput | ThumbnailUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: ThumbnailCreateManyAssetInputEnvelope
    set?: ThumbnailWhereUniqueInput | ThumbnailWhereUniqueInput[]
    disconnect?: ThumbnailWhereUniqueInput | ThumbnailWhereUniqueInput[]
    delete?: ThumbnailWhereUniqueInput | ThumbnailWhereUniqueInput[]
    connect?: ThumbnailWhereUniqueInput | ThumbnailWhereUniqueInput[]
    update?: ThumbnailUpdateWithWhereUniqueWithoutAssetInput | ThumbnailUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: ThumbnailUpdateManyWithWhereWithoutAssetInput | ThumbnailUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: ThumbnailScalarWhereInput | ThumbnailScalarWhereInput[]
  }

  export type ThumbnailUncheckedUpdateManyWithoutAssetNestedInput = {
    create?: XOR<ThumbnailCreateWithoutAssetInput, ThumbnailUncheckedCreateWithoutAssetInput> | ThumbnailCreateWithoutAssetInput[] | ThumbnailUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: ThumbnailCreateOrConnectWithoutAssetInput | ThumbnailCreateOrConnectWithoutAssetInput[]
    upsert?: ThumbnailUpsertWithWhereUniqueWithoutAssetInput | ThumbnailUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: ThumbnailCreateManyAssetInputEnvelope
    set?: ThumbnailWhereUniqueInput | ThumbnailWhereUniqueInput[]
    disconnect?: ThumbnailWhereUniqueInput | ThumbnailWhereUniqueInput[]
    delete?: ThumbnailWhereUniqueInput | ThumbnailWhereUniqueInput[]
    connect?: ThumbnailWhereUniqueInput | ThumbnailWhereUniqueInput[]
    update?: ThumbnailUpdateWithWhereUniqueWithoutAssetInput | ThumbnailUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: ThumbnailUpdateManyWithWhereWithoutAssetInput | ThumbnailUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: ThumbnailScalarWhereInput | ThumbnailScalarWhereInput[]
  }

  export type MediaAssetCreateNestedOneWithoutThumbnailsInput = {
    create?: XOR<MediaAssetCreateWithoutThumbnailsInput, MediaAssetUncheckedCreateWithoutThumbnailsInput>
    connectOrCreate?: MediaAssetCreateOrConnectWithoutThumbnailsInput
    connect?: MediaAssetWhereUniqueInput
  }

  export type EnumThumbnailVariantFieldUpdateOperationsInput = {
    set?: $Enums.ThumbnailVariant
  }

  export type MediaAssetUpdateOneRequiredWithoutThumbnailsNestedInput = {
    create?: XOR<MediaAssetCreateWithoutThumbnailsInput, MediaAssetUncheckedCreateWithoutThumbnailsInput>
    connectOrCreate?: MediaAssetCreateOrConnectWithoutThumbnailsInput
    upsert?: MediaAssetUpsertWithoutThumbnailsInput
    connect?: MediaAssetWhereUniqueInput
    update?: XOR<XOR<MediaAssetUpdateToOneWithWhereWithoutThumbnailsInput, MediaAssetUpdateWithoutThumbnailsInput>, MediaAssetUncheckedUpdateWithoutThumbnailsInput>
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

  export type NestedEnumMediaStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MediaStatus | EnumMediaStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MediaStatus[] | ListEnumMediaStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MediaStatus[] | ListEnumMediaStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMediaStatusFilter<$PrismaModel> | $Enums.MediaStatus
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

  export type NestedEnumMediaStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MediaStatus | EnumMediaStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MediaStatus[] | ListEnumMediaStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MediaStatus[] | ListEnumMediaStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMediaStatusWithAggregatesFilter<$PrismaModel> | $Enums.MediaStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMediaStatusFilter<$PrismaModel>
    _max?: NestedEnumMediaStatusFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
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
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
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

  export type NestedEnumThumbnailVariantFilter<$PrismaModel = never> = {
    equals?: $Enums.ThumbnailVariant | EnumThumbnailVariantFieldRefInput<$PrismaModel>
    in?: $Enums.ThumbnailVariant[] | ListEnumThumbnailVariantFieldRefInput<$PrismaModel>
    notIn?: $Enums.ThumbnailVariant[] | ListEnumThumbnailVariantFieldRefInput<$PrismaModel>
    not?: NestedEnumThumbnailVariantFilter<$PrismaModel> | $Enums.ThumbnailVariant
  }

  export type NestedEnumThumbnailVariantWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ThumbnailVariant | EnumThumbnailVariantFieldRefInput<$PrismaModel>
    in?: $Enums.ThumbnailVariant[] | ListEnumThumbnailVariantFieldRefInput<$PrismaModel>
    notIn?: $Enums.ThumbnailVariant[] | ListEnumThumbnailVariantFieldRefInput<$PrismaModel>
    not?: NestedEnumThumbnailVariantWithAggregatesFilter<$PrismaModel> | $Enums.ThumbnailVariant
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumThumbnailVariantFilter<$PrismaModel>
    _max?: NestedEnumThumbnailVariantFilter<$PrismaModel>
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

  export type ThumbnailCreateWithoutAssetInput = {
    id: string
    variant: $Enums.ThumbnailVariant
    s3Key: string
    width: number
    height: number
    createdAt?: Date | string
  }

  export type ThumbnailUncheckedCreateWithoutAssetInput = {
    id: string
    variant: $Enums.ThumbnailVariant
    s3Key: string
    width: number
    height: number
    createdAt?: Date | string
  }

  export type ThumbnailCreateOrConnectWithoutAssetInput = {
    where: ThumbnailWhereUniqueInput
    create: XOR<ThumbnailCreateWithoutAssetInput, ThumbnailUncheckedCreateWithoutAssetInput>
  }

  export type ThumbnailCreateManyAssetInputEnvelope = {
    data: ThumbnailCreateManyAssetInput | ThumbnailCreateManyAssetInput[]
    skipDuplicates?: boolean
  }

  export type ThumbnailUpsertWithWhereUniqueWithoutAssetInput = {
    where: ThumbnailWhereUniqueInput
    update: XOR<ThumbnailUpdateWithoutAssetInput, ThumbnailUncheckedUpdateWithoutAssetInput>
    create: XOR<ThumbnailCreateWithoutAssetInput, ThumbnailUncheckedCreateWithoutAssetInput>
  }

  export type ThumbnailUpdateWithWhereUniqueWithoutAssetInput = {
    where: ThumbnailWhereUniqueInput
    data: XOR<ThumbnailUpdateWithoutAssetInput, ThumbnailUncheckedUpdateWithoutAssetInput>
  }

  export type ThumbnailUpdateManyWithWhereWithoutAssetInput = {
    where: ThumbnailScalarWhereInput
    data: XOR<ThumbnailUpdateManyMutationInput, ThumbnailUncheckedUpdateManyWithoutAssetInput>
  }

  export type ThumbnailScalarWhereInput = {
    AND?: ThumbnailScalarWhereInput | ThumbnailScalarWhereInput[]
    OR?: ThumbnailScalarWhereInput[]
    NOT?: ThumbnailScalarWhereInput | ThumbnailScalarWhereInput[]
    id?: UuidFilter<"Thumbnail"> | string
    mediaAssetId?: UuidFilter<"Thumbnail"> | string
    variant?: EnumThumbnailVariantFilter<"Thumbnail"> | $Enums.ThumbnailVariant
    s3Key?: StringFilter<"Thumbnail"> | string
    width?: IntFilter<"Thumbnail"> | number
    height?: IntFilter<"Thumbnail"> | number
    createdAt?: DateTimeFilter<"Thumbnail"> | Date | string
  }

  export type MediaAssetCreateWithoutThumbnailsInput = {
    id: string
    s3Key: string
    contentType: string
    sizeBytes: number
    width?: number | null
    height?: number | null
    status?: $Enums.MediaStatus
    uploadedBy: string
    altText?: string | null
    failureReason?: string | null
    retryCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    confirmedAt?: Date | string | null
    readyAt?: Date | string | null
  }

  export type MediaAssetUncheckedCreateWithoutThumbnailsInput = {
    id: string
    s3Key: string
    contentType: string
    sizeBytes: number
    width?: number | null
    height?: number | null
    status?: $Enums.MediaStatus
    uploadedBy: string
    altText?: string | null
    failureReason?: string | null
    retryCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    confirmedAt?: Date | string | null
    readyAt?: Date | string | null
  }

  export type MediaAssetCreateOrConnectWithoutThumbnailsInput = {
    where: MediaAssetWhereUniqueInput
    create: XOR<MediaAssetCreateWithoutThumbnailsInput, MediaAssetUncheckedCreateWithoutThumbnailsInput>
  }

  export type MediaAssetUpsertWithoutThumbnailsInput = {
    update: XOR<MediaAssetUpdateWithoutThumbnailsInput, MediaAssetUncheckedUpdateWithoutThumbnailsInput>
    create: XOR<MediaAssetCreateWithoutThumbnailsInput, MediaAssetUncheckedCreateWithoutThumbnailsInput>
    where?: MediaAssetWhereInput
  }

  export type MediaAssetUpdateToOneWithWhereWithoutThumbnailsInput = {
    where?: MediaAssetWhereInput
    data: XOR<MediaAssetUpdateWithoutThumbnailsInput, MediaAssetUncheckedUpdateWithoutThumbnailsInput>
  }

  export type MediaAssetUpdateWithoutThumbnailsInput = {
    id?: StringFieldUpdateOperationsInput | string
    s3Key?: StringFieldUpdateOperationsInput | string
    contentType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumMediaStatusFieldUpdateOperationsInput | $Enums.MediaStatus
    uploadedBy?: StringFieldUpdateOperationsInput | string
    altText?: NullableStringFieldUpdateOperationsInput | string | null
    failureReason?: NullableStringFieldUpdateOperationsInput | string | null
    retryCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    readyAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MediaAssetUncheckedUpdateWithoutThumbnailsInput = {
    id?: StringFieldUpdateOperationsInput | string
    s3Key?: StringFieldUpdateOperationsInput | string
    contentType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumMediaStatusFieldUpdateOperationsInput | $Enums.MediaStatus
    uploadedBy?: StringFieldUpdateOperationsInput | string
    altText?: NullableStringFieldUpdateOperationsInput | string | null
    failureReason?: NullableStringFieldUpdateOperationsInput | string | null
    retryCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    readyAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ThumbnailCreateManyAssetInput = {
    id: string
    variant: $Enums.ThumbnailVariant
    s3Key: string
    width: number
    height: number
    createdAt?: Date | string
  }

  export type ThumbnailUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    variant?: EnumThumbnailVariantFieldUpdateOperationsInput | $Enums.ThumbnailVariant
    s3Key?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ThumbnailUncheckedUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    variant?: EnumThumbnailVariantFieldUpdateOperationsInput | $Enums.ThumbnailVariant
    s3Key?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ThumbnailUncheckedUpdateManyWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    variant?: EnumThumbnailVariantFieldUpdateOperationsInput | $Enums.ThumbnailVariant
    s3Key?: StringFieldUpdateOperationsInput | string
    width?: IntFieldUpdateOperationsInput | number
    height?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use MediaAssetCountOutputTypeDefaultArgs instead
     */
    export type MediaAssetCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MediaAssetCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MediaAssetDefaultArgs instead
     */
    export type MediaAssetArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MediaAssetDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ThumbnailDefaultArgs instead
     */
    export type ThumbnailArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ThumbnailDefaultArgs<ExtArgs>
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