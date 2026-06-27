export const ALL_MODULES = [
  "usuarios", "finance", "agenda", "tasks", "blog", "users", "audit", "settings"
];

export function isModuleAllowed(moduleKey, clientConfig) {
  return clientConfig?.dashboard?.modules?.[moduleKey] !== false;
}
