export default {
  install() {
    const originalFetch = window.fetch;
    const abortControllers = {};

    window.fetch = async (input, init = {}) => {
      const url = typeof input === "string" ? input : input.url;
      const { type } = init;

      if (type && abortControllers[type]) {
        abortControllers[type].abort();
      }

      const controller = new AbortController();

      if (type) abortControllers[type] = controller;

      const response = await originalFetch(url, {
        ...init,
        signal: controller.signal,
      });

      return response;
    };
  },
};
