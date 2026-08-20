// Relative: in dev, Angular's dev-server proxy (proxy.conf.json) forwards
// /tasks to the backend; in the single-container Docker setup, the backend
// serves both the API and these static files from the same origin.
export const API_BASE_URL = '';
