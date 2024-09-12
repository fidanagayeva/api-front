import axios, { AxiosRequestConfig } from "axios";
import useSWR, { SWRConfiguration, Key } from "swr";
import type { SWRMutationConfiguration } from "swr/mutation";
import useSWRMutation from "swr/mutation";
import { api } from "./api";

export const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});
interface IRequestConfig extends AxiosRequestConfig {
  module: keyof typeof api;
  axiosResponse?: boolean;
  noErrorPopup?: boolean;
  cacheOnly?: boolean;
}
type TKeysOfUnion<T> = T extends T ? Exclude<keyof T, "baseUrl"> : never;

export function fetcher(
  key: TKeysOfUnion<(typeof api)[typeof module]>,
  { module, method = "GET", ...rest }: IRequestConfig
) {
  return axiosInstance({
    url: `${api[module].baseUrl}/${(api[module] as any)[key]}`,
    method,
    ...rest,
  });
}

export function useRequest<Data = any, Error = any>(
  key: TKeysOfUnion<(typeof api)[typeof module]> | (() => string | null),
  {
    method = "GET",
    module,
    headers: customHeaders,
    cacheOnly,
    ...rest
  }: IRequestConfig,
  options: SWRConfiguration = {}
) {
  const k: Key = typeof key === "function" ? key : (api[module] as any)[key];
  const fetcher = (url: string) => {
    if (cacheOnly) {
      return Promise.resolve();
    }
    return axiosInstance({
      method,
      url: `${api[module].baseUrl}/${url}`,
      ...rest,
      headers: {
        ...customHeaders,
      },
    }).then((res) => {
      return res?.data;
    });
  };
  const response = useSWR<Data, Error>(k, fetcher, options);
  return { ...response };
}

export function useRequestMutation<Data = any, Error = any>(
  key: TKeysOfUnion<(typeof api)[typeof module]> | (() => string | null),
  {
    method = "GET",
    module,
    headers: customHeaders,
    axiosResponse,
    noErrorPopup = false,
    ...rest
  }: IRequestConfig,
  options?: SWRMutationConfiguration<Data, Error>
) {
  const k: Key = typeof key === "function" ? key : (api[module] as any)[key];
  const fetcher = (url: string, { arg }: any) => {
    if (arg.cacheOnly) {
      return Promise.resolve();
    }
    const requestOptions = {
      noErrorPopup,
      method,
      url: `${api[module].baseUrl}/${url.replace("{{id}}", arg?.dynamicValue)}`,
      ...rest,
      headers: {
        ...customHeaders,
      },
    };

    if (arg.params) {
      requestOptions.params = arg.params;
    }
    if (arg.paramsSerializer) {
      requestOptions.paramsSerializer = arg.paramsSerializer;
    }
    requestOptions.url = arg?.dynamicValue
      ? `${api[module].baseUrl}/${url.replace("{{id}}", arg?.dynamicValue)}`
      : `${api[module].baseUrl}/${url}`;
    requestOptions.data = arg?.body;
    return axiosInstance(requestOptions).then((res) =>
      axiosResponse ? res : res?.data
    );
  };

  const { trigger, ...response } = useSWRMutation<Data, Error>(
    k,
    fetcher,
    options
  );
  return {
    trigger: (
      value: TTriggerArgs = {},
      options?: SWRMutationConfiguration<any, any>
    ) => {
      return trigger(value as any, options as any);
    },
    ...response,
  };
}

type TTriggerArgs = {
  body?: any;
  dynamicValue?: any;
  params?: any;
  cacheOnly?: boolean;
  paramsSerializer?: any;
};
