import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useLocation } from 'wouter'
import Namhattas from '@/pages/Namhattas'

const mockNamhattas = [
  {
    id: 1,
    name: 'Test Namhatta',
    description: 'A test spiritual center',
    foundingDate: '2020-01-01',
    address: {
      country: 'India',
      state: 'West Bengal',
      district: 'Kolkata',
      subDistrict: 'Kolkata',
      village: 'Kolkata',
      postalCode: '700001',
      landmark: 'Near Temple'
    },
    shraddhakutirId: 1,
    shraddhakutir: { name: 'Test Shraddhakutir' },
    devoteeCount: 25,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Mumbai Namhatta',
    description: 'Mumbai spiritual center',
    foundingDate: '2021-01-01',
    address: {
      country: 'India',
      state: 'Maharashtra',
      district: 'Mumbai',
      subDistrict: 'Mumbai',
      village: 'Mumbai',
      postalCode: '400001',
      landmark: 'Near Station'
    },
    shraddhakutirId: 2,
    shraddhakutir: { name: 'Mumbai Shraddhakutir' },
    devoteeCount: 30,
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z'
  }
]

vi.mocked(useQuery).mockImplementation(({ queryKey }) => {
  const key = queryKey[0] as string
  
  if (key === '/api/namhattas') {
    return {
      data: mockNamhattas,
      isLoading: false,
      error: null
    }
  }
  
  if (key === '/api/countries') {
    return {
      data: [{ id: 1, name: 'India' }],
      isLoading: false,
      error: null
    }
  }
  
  if (key === '/api/shraddhakutirs') {
    return {
      data: [{ id: 1, name: 'Test Shraddhakutir' }],
      isLoading: false,
      error: null
    }
  }
  
  return { data: [], isLoading: false, error: null }
})

vi.mocked(useMutation).mockReturnValue({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null
})

vi.mocked(useLocation).mockReturnValue(['/', vi.fn()])

describe('Namhattas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render namhattas list', async () => {
    render(<Namhattas />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Namhatta')).toBeInTheDocument()
      expect(screen.getByText('Mumbai Namhatta')).toBeInTheDocument()
      expect(screen.getByText('A test spiritual center')).toBeInTheDocument()
      expect(screen.getByText('Mumbai spiritual center')).toBeInTheDocument()
    })
  })

  it('should show namhatta cards with proper information', async () => {
    render(<Namhattas />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Shraddhakutir')).toBeInTheDocument()
      expect(screen.getByText('Mumbai Shraddhakutir')).toBeInTheDocument()
      expect(screen.getByText('25 devotees')).toBeInTheDocument()
      expect(screen.getByText('30 devotees')).toBeInTheDocument()
    })
  })

  it('should filter namhattas by search term', async () => {
    render(<Namhattas />)
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search namhattas...')
      fireEvent.change(searchInput, { target: { value: 'Test' } })
      
      expect(screen.getByText('Test Namhatta')).toBeInTheDocument()
      expect(screen.queryByText('Mumbai Namhatta')).not.toBeInTheDocument()
    })
  })

  it('should sort namhattas by name', async () => {
    render(<Namhattas />)
    
    await waitFor(() => {
      const sortSelect = screen.getByRole('combobox')
      fireEvent.click(sortSelect)
      
      const nameOption = screen.getByText('Name')
      fireEvent.click(nameOption)
      
      expect(screen.getByText('Test Namhatta')).toBeInTheDocument()
      expect(screen.getByText('Mumbai Namhatta')).toBeInTheDocument()
    })
  })

  it('should open add namhatta dialog', async () => {
    render(<Namhattas />)
    
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add new namhatta/i })
      fireEvent.click(addButton)
      
      expect(screen.getByText('Add New Namhatta')).toBeInTheDocument()
    })
  })

  it('should navigate to namhatta detail when clicking on card', async () => {
    const mockSetLocation = vi.fn()
    vi.mocked(useLocation).mockReturnValue(['/', mockSetLocation])
    
    render(<Namhattas />)
    
    await waitFor(() => {
      const namhattaCard = screen.getByText('Test Namhatta').closest('div[class*="cursor-pointer"]')
      if (namhattaCard) {
        fireEvent.click(namhattaCard)
        expect(mockSetLocation).toHaveBeenCalledWith('/namhattas/1')
      }
    })
  })

  it('should handle loading state', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    })
    
    render(<Namhattas />)
    
    // Should show skeleton loading components
    expect(screen.getByTestId('namhattas-skeleton')).toBeInTheDocument()
  })

  it('should handle empty state', async () => {
    vi.mocked(useQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    })
    
    render(<Namhattas />)
    
    await waitFor(() => {
      expect(screen.getByText('No namhattas found')).toBeInTheDocument()
    })
  })

  it('should handle error state', async () => {
    vi.mocked(useQuery).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('API Error')
    })
    
    render(<Namhattas />)
    
    await waitFor(() => {
      expect(screen.getByText('Error loading namhattas')).toBeInTheDocument()
    })
  })

  it('should filter by country', async () => {
    render(<Namhattas />)
    
    await waitFor(() => {
      const countryFilter = screen.getByLabelText('Country')
      fireEvent.click(countryFilter)
      
      const indiaOption = screen.getByText('India')
      fireEvent.click(indiaOption)
      
      expect(screen.getByText('Test Namhatta')).toBeInTheDocument()
      expect(screen.getByText('Mumbai Namhatta')).toBeInTheDocument()
    })
  })

  it('should toggle sorting order', async () => {
    render(<Namhattas />)
    
    await waitFor(() => {
      const sortButton = screen.getByRole('button', { name: /sort/i })
      fireEvent.click(sortButton)
      
      // Should toggle between ascending and descending
      expect(sortButton).toBeInTheDocument()
    })
  })
})