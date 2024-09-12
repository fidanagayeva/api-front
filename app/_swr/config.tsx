import type { SWRConfiguration } from "swr";

export const defaultValues: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  onError: () => {},
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    console.log(error);
    if (
      error.response &&
      (error.response.status === 404 || error.response.status === 400)
    )
      return;
    if (retryCount >= 2) return;
    setTimeout(() => revalidate({ retryCount }), 5000);
  },
};
