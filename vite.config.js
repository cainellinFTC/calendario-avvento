import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carica le variabili d'ambiente
  const env = loadEnv(mode, process.cwd(), '')
  console.log('🔍 Mode:', mode)
  console.log('🔍 Env loaded:', { ENABLE_DEBUG: env.VITE_ENABLE_DEBUG, MONTH: env.VITE_MONTH })

  return {
    plugins: [react()],
    base: '/calendario-avvento/',
    define: {
      // Forza i valori delle variabili d'ambiente
      'import.meta.env.VITE_ENABLE_DEBUG': JSON.stringify(env.VITE_ENABLE_DEBUG || 'false'),
      'import.meta.env.VITE_MONTH': JSON.stringify(env.VITE_MONTH || '11'),
      'import.meta.env.VITE_TEST_DAY': JSON.stringify(env.VITE_TEST_DAY || ''),
      'import.meta.env.VITE_MAX_PAST_DAYS': JSON.stringify(env.VITE_MAX_PAST_DAYS || '3'),
    }
  }
})
