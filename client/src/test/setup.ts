import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock the wouter router
vi.mock('wouter', () => ({
  useLocation: vi.fn(() => ['/', vi.fn()]),
  useRoute: vi.fn(() => [false, {}]),
  Link: ({ children, ...props }: any) => {
    return { type: 'a', props: { ...props, children } }
  },
  Switch: ({ children }: any) => {
    return { type: 'div', props: { children } }
  },
  Route: ({ component: Component, ...props }: any) => {
    return Component ? { type: Component, props } : null
  },
}))

// Mock the API module
vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }: any) => children,
}))

// Mock the theme provider
vi.mock('@/components/ui/theme-provider', () => ({
  ThemeProvider: ({ children }: any) => children,
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}))

// Mock the tooltip provider
vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => children,
  Tooltip: ({ children }: any) => children,
  TooltipContent: ({ children }: any) => ({ type: 'div', props: { children } }),
  TooltipTrigger: ({ children }: any) => ({ type: 'div', props: { children } }),
}))

// Mock the toaster
vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => null,
}))

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => {
  const icons = [
    'Users', 'Home', 'Calendar', 'AlertTriangle', 'Crown', 'UserCheck',
    'Download', 'Plus', 'TrendingUp', 'ArrowRight', 'Zap', 'UserPlus',
    'CalendarPlus', 'BarChart3', 'Music', 'BookOpen', 'Sparkles',
    'Heart', 'Star', 'Gift', 'Utensils', 'MapPin', 'Search', 'Filter',
    'Edit', 'Eye', 'Trash', 'Check', 'X', 'ChevronDown', 'ChevronUp',
    'Menu', 'Sun', 'Moon', 'Bell', 'Settings', 'LogOut', 'User',
    'Mail', 'Phone', 'MapPin', 'Building', 'FileText', 'Camera',
    'Upload', 'Save', 'Cancel', 'RefreshCw', 'MoreHorizontal',
    'ChevronLeft', 'ChevronRight', 'ExternalLink', 'Copy', 'Share',
    'Printer', 'Download', 'Upload', 'Folder', 'File', 'Image',
    'Video', 'Clock', 'Calendar', 'Globe', 'Lock', 'Unlock',
    'Shield', 'Key', 'Database', 'Server', 'Monitor', 'Smartphone',
    'Tablet', 'Laptop', 'Desktop', 'Wifi', 'WifiOff', 'Signal',
    'Battery', 'Power', 'Volume', 'VolumeX', 'Play', 'Pause',
    'Stop', 'SkipBack', 'SkipForward', 'Repeat', 'Shuffle', 'Award',
    'Briefcase', 'HandHeart'
  ];
  
  const mockIcons = {};
  icons.forEach(icon => {
    mockIcons[icon] = ({ children, ...props }: any) => ({
      type: 'svg',
      props: { 'data-testid': `${icon}-icon`, ...props, children }
    });
  });
  
  return mockIcons;
})

// Mock React Icons
vi.mock('react-icons/si', () => ({
  SiGoogle: () => ({ type: 'svg', props: { 'data-testid': 'google-icon' } }),
  SiFacebook: () => ({ type: 'svg', props: { 'data-testid': 'facebook-icon' } }),
  SiTwitter: () => ({ type: 'svg', props: { 'data-testid': 'twitter-icon' } }),
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => date.toISOString()),
  parseISO: vi.fn((dateStr) => new Date(dateStr)),
  isValid: vi.fn(() => true),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => ({ type: 'div', props: { ...props, children } }),
    button: ({ children, ...props }: any) => ({ type: 'button', props: { ...props, children } }),
    span: ({ children, ...props }: any) => ({ type: 'span', props: { ...props, children } }),
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock recharts
vi.mock('recharts', () => ({
  PieChart: ({ children }: any) => ({ type: 'div', props: { 'data-testid': 'pie-chart', children } }),
  Pie: () => ({ type: 'div', props: { 'data-testid': 'pie' } }),
  Cell: () => ({ type: 'div', props: { 'data-testid': 'cell' } }),
  ResponsiveContainer: ({ children }: any) => ({ type: 'div', props: { 'data-testid': 'responsive-container', children } }),
  Tooltip: () => ({ type: 'div', props: { 'data-testid': 'chart-tooltip' } }),
}))

// Mock react-simple-maps
vi.mock('react-simple-maps', () => ({
  ComposableMap: ({ children }: any) => ({ type: 'div', props: { 'data-testid': 'composable-map', children } }),
  Geographies: ({ children }: any) => ({ type: 'div', props: { 'data-testid': 'geographies', children } }),
  Geography: () => ({ type: 'div', props: { 'data-testid': 'geography' } }),
  Marker: ({ children }: any) => ({ type: 'div', props: { 'data-testid': 'marker', children } }),
  ZoomableGroup: ({ children }: any) => ({ type: 'div', props: { 'data-testid': 'zoomable-group', children } }),
}))

// Mock leaflet
vi.mock('leaflet', () => ({
  map: vi.fn(),
  tileLayer: vi.fn(),
  marker: vi.fn(),
  icon: vi.fn(),
  divIcon: vi.fn(),
}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})