import { vi } from 'vitest'

// Mock environment variables
process.env.SUPABASE_PROJECT_URL = 'https://test.supabase.co'
process.env.SUPABASE_PUBLIC_ANON_KEY = 'test-key'
process.env.RESEND_API_KEY = 'test-resend-key'

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}))

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    genSalt: vi.fn().mockResolvedValue('salt'),
    hash: vi.fn().mockResolvedValue('hashedPassword'),
    compare: vi.fn().mockResolvedValue(true),
  },
  genSalt: vi.fn().mockResolvedValue('salt'),
  hash: vi.fn().mockResolvedValue('hashedPassword'),
  compare: vi.fn().mockResolvedValue(true),
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'MMMM d, yyyy') return 'January 1, 2024'
    if (formatStr === 'MMM d') return 'Jan 1'
    return '2024-01-01'
  }),
}))

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

// Global test utilities
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
} 