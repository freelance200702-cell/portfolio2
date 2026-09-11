export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  appEnv: import.meta.env.VITE_APP_ENV || (import.meta.env.PROD ? 'production' : 'development'),
  appTitle: import.meta.env.VITE_APP_TITLE || 'Interactive 3D Portfolio',
  isConfigured: Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder-project.supabase.co' &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== 'placeholder-anon-key'
  ),
  isProduction: Boolean(import.meta.env.PROD || import.meta.env.VITE_APP_ENV === 'production'),
};
