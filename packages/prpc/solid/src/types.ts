import type zod from 'zod'
import type { getRequestEvent } from 'solid-js/web'
import { Accessor } from 'solid-js'
import { FCreateQueryOptions } from './query'
import { CreateMutationResult, CreateQueryResult } from '@tanstack/solid-query'
import { FCreateMutationOptions } from './mutation'

export type EmptySchema = void | undefined

export type ExpectedSchema = zod.ZodSchema | EmptySchema

export type Infer$PayLoad<ZObj extends ExpectedSchema> =
  ZObj extends zod.ZodSchema ? zod.infer<ZObj> : never

export type PRPCEvent = NonNullable<ReturnType<typeof getRequestEvent>>

export type ExpectedFn<
  ZObject = EmptySchema,
  Mw extends IMiddleware<any>[] | void = void
> = ZObject extends EmptySchema
  ? (input: Fn$Input<ZObject, Mw>) => any
  : ZObject extends zod.ZodSchema
  ? (input: Fn$Input<ZObject, Mw>) => any
  : (input: Fn$Input<never, Mw>) => any

type P = {
  event$: PRPCEvent
}

export type IMiddleware<T = any> = (ctx$: T & P) => any

export type Fn$Input<
  ZObj extends ExpectedSchema = EmptySchema,
  Mw extends IMiddleware<any>[] | void = void
> = {
  payload: Infer$PayLoad<ZObj>
  event$: PRPCEvent
  ctx$: FilterOutResponse<InferFinalMiddlware<Mw>>
}

export type Fn$Output<
  Fn extends ExpectedFn<ZObject, Mw>,
  ZObject = EmptySchema,
  Mw extends IMiddleware[] | void = void
> = FilterOutResponse<
  ReturnType<Fn> extends Promise<infer T> ? T : ReturnType<Fn>
>

export type OmitQueryData<T> = Omit<
  T,
  'queryKey' | 'queryFn' | 'mutationFn' | 'mutationKey'
>

export type InferReturnType<T> = T extends (...args: any[]) => infer R
  ? R extends Promise<infer R2>
    ? R2
    : R
  : unknown

export type FilterOutResponse<T> = T extends Response ? never : T

export type FlattenArray<T> = T extends (infer U)[] ? U : T

export type InferFinalMiddlware<Mw extends IMiddleware[] | IMiddleware | void> =
  Mw extends IMiddleware[] ? InferReturnType<TakeLast<Mw>> : InferReturnType<Mw>

type TakeLast<T extends any[]> = T extends [...infer _, infer L] ? L : unknown

export type PossibleBuilderTypes = 'query' | 'mutation'

export type QueryBuilder<
  Fn extends ExpectedFn<ZObj, Mws>,
  Mws extends IMiddleware<any>[] | void = void,
  ZObj extends ExpectedSchema = EmptySchema,
  BuilderType extends PossibleBuilderTypes | void = void
> = (BuilderType extends 'query'
  ? {
      (
        input: ZObj extends EmptySchema
          ? EmptySchema
          : Accessor<Infer$PayLoad<ZObj>>,
        opts?: FCreateQueryOptions<Infer$PayLoad<ZObj>>
      ): CreateQueryResult<Fn$Output<Fn, ZObj, Mws>>
    }
  : {}) &
  (BuilderType extends 'mutation'
    ? {
        (
          opts?: FCreateMutationOptions<Infer$PayLoad<ZObj>>
        ): CreateMutationResult<Fn$Output<Fn, ZObj, Mws>>
      }
    : {} & BuilderType extends void
    ? {
        query$<NewFn extends ExpectedFn<ZObj, Mws>>(
          fn: NewFn,
          key: string
        ): QueryBuilder<NewFn, Mws, ZObj, 'query'>
        mutation$<NewFn extends ExpectedFn<ZObj, Mws>>(
          fn: NewFn,
          key: string
        ): QueryBuilder<NewFn, Mws, ZObj, 'mutation'>
      }
    : {}) &
  (ZObj extends EmptySchema
    ? {
        input<NewZObj extends ExpectedSchema>(
          schema: NewZObj
        ): QueryBuilder<ExpectedFn<NewZObj, Mws>, Mws, NewZObj>
      }
    : {}) &
  (BuilderType extends void
    ? {
        middleware$<Mw extends IMiddleware<P & InferFinalMiddlware<Mws>>>(
          mw: Mw
        ): QueryBuilder<
          ExpectedFn<ZObj, Mws extends IMiddleware[] ? [...Mws, Mw] : [Mw]>,
          Mws extends IMiddleware[] ? [...Mws, Mw] : [Mw],
          ZObj
        >
      }
    : {})
