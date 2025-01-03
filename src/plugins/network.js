import { reactive } from "vue";

export default {
  install(app, router) {
    const networkStatus = reactive({
      ongoingRequests: 0,
      completedRequests: 0,
      totalRequests: 0,
    });

    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      networkStatus.ongoingRequests += 1;
      networkStatus.totalRequests += 1;

      try {
        const response = await originalFetch(...args);
        networkStatus.completedRequests += 1;
        networkStatus.ongoingRequests -= 1;
        return response;
      } catch (error) {
        networkStatus.completedRequests += 1;
        networkStatus.ongoingRequests -= 1;
        throw error;
      }
    };

    router.beforeEach((to, from, next) => {
      if (to.path !== from.path) {
        networkStatus.ongoingRequests = 0;
        networkStatus.completedRequests = 0;
        networkStatus.totalRequests = 0;
      }
      next();
    });

    app.config.globalProperties.$networkStatus = networkStatus;
  },
};
