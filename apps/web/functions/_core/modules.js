export const ALL_MODULES = [
  "people", "finance", "agenda", "tasks", "blog", "users", "audit", "settings"
];

export function isModuleAllowed(moduleKey, clientConfig) {
  return clientConfig?.dashboard?.modules?.[moduleKey] !== false;
}
