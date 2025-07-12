import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useQuery } from '@tanstack/react-query'
import Hierarchy from '@/pages/Hierarchy'

const mockHierarchy = {
  founder: [
    { id: 1, name: 'His Divine Grace A.C. Bhaktivedanta Swami Prabhupada', role: 'Founder-Acharya' }
  ],
  currentAcharya: [
    { id: 2, name: 'His Holiness Jayapataka Swami', role: 'Current Acharya' }
  ],
  regionalDirectors: [
    { id: 3, name: 'Test Regional Director', role: 'Regional Director', location: 'West Bengal' }
  ],
  coRegionalDirectors: [
    { id: 4, name: 'Test Co-Regional Director', role: 'Co-Regional Director', location: 'Mumbai' }
  ],
  districtSupervisors: [
    { id: 5, name: 'Test District Supervisor', role: 'District Supervisor', location: 'Kolkata' },
    { id: 6, name: 'Mumbai District Supervisor', role: 'District Supervisor', location: 'Mumbai' }
  ],
  malaSenapotis: [
    { id: 7, name: 'Test Mala Senapoti', role: 'Mala Senapoti', location: 'Kolkata' },
    { id: 8, name: 'Mumbai Mala Senapoti', role: 'Mala Senapoti', location: 'Mumbai' }
  ]
}

vi.mocked(useQuery).mockImplementation(({ queryKey }) => {
  const key = queryKey[0] as string
  
  if (key === '/api/hierarchy') {
    return {
      data: mockHierarchy,
      isLoading: false,
      error: null
    }
  }
  
  return { data: null, isLoading: false, error: null }
})

describe('Hierarchy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render hierarchy levels', async () => {
    render(<Hierarchy />)
    
    await waitFor(() => {
      expect(screen.getByText('Leadership Hierarchy')).toBeInTheDocument()
      expect(screen.getByText('His Divine Grace A.C. Bhaktivedanta Swami Prabhupada')).toBeInTheDocument()
      expect(screen.getByText('His Holiness Jayapataka Swami')).toBeInTheDocument()
      expect(screen.getByText('Test Regional Director')).toBeInTheDocument()
      expect(screen.getByText('Test Co-Regional Director')).toBeInTheDocument()
    })
  })

  it('should show collapsible district supervisors section', async () => {
    render(<Hierarchy />)
    
    await waitFor(() => {
      expect(screen.getByText('District Supervisors')).toBeInTheDocument()
      
      const expandButton = screen.getByRole('button', { name: /expand district supervisors/i })
      fireEvent.click(expandButton)
      
      expect(screen.getByText('Test District Supervisor')).toBeInTheDocument()
      expect(screen.getByText('Mumbai District Supervisor')).toBeInTheDocument()
    })
  })

  it('should display role titles correctly', async () => {
    render(<Hierarchy />)
    
    await waitFor(() => {
      expect(screen.getByText('Founder-Acharya')).toBeInTheDocument()
      expect(screen.getByText('Current Acharya')).toBeInTheDocument()
      expect(screen.getByText('Regional Director')).toBeInTheDocument()
      expect(screen.getByText('Co-Regional Director')).toBeInTheDocument()
    })
  })

  it('should show locations for lower hierarchy levels', async () => {
    render(<Hierarchy />)
    
    await waitFor(() => {
      expect(screen.getByText('West Bengal')).toBeInTheDocument()
      expect(screen.getByText('Mumbai')).toBeInTheDocument()
      expect(screen.getByText('Kolkata')).toBeInTheDocument()
    })
  })

  it('should handle loading state', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    })
    
    render(<Hierarchy />)
    
    expect(screen.getByTestId('hierarchy-skeleton')).toBeInTheDocument()
  })

  it('should handle error state', async () => {
    vi.mocked(useQuery).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('API Error')
    })
    
    render(<Hierarchy />)
    
    await waitFor(() => {
      expect(screen.getByText('Error loading hierarchy data')).toBeInTheDocument()
    })
  })

  it('should display hierarchy in proper visual order', async () => {
    render(<Hierarchy />)
    
    await waitFor(() => {
      const hierarchyItems = screen.getAllByRole('article')
      
      // Should be in hierarchical order
      expect(hierarchyItems[0]).toHaveTextContent('His Divine Grace A.C. Bhaktivedanta Swami Prabhupada')
      expect(hierarchyItems[1]).toHaveTextContent('His Holiness Jayapataka Swami')
      expect(hierarchyItems[2]).toHaveTextContent('Test Regional Director')
    })
  })

  it('should show connection lines between hierarchy levels', async () => {
    render(<Hierarchy />)
    
    await waitFor(() => {
      const connectionLines = screen.getAllByTestId('connection-line')
      expect(connectionLines.length).toBeGreaterThan(0)
    })
  })

  it('should handle empty hierarchy data', async () => {
    vi.mocked(useQuery).mockReturnValue({
      data: {
        founder: [],
        currentAcharya: [],
        regionalDirectors: [],
        coRegionalDirectors: [],
        districtSupervisors: [],
        malaSenapotis: []
      },
      isLoading: false,
      error: null
    })
    
    render(<Hierarchy />)
    
    await waitFor(() => {
      expect(screen.getByText('No hierarchy data available')).toBeInTheDocument()
    })
  })

  it('should collapse and expand district supervisors', async () => {
    render(<Hierarchy />)
    
    await waitFor(() => {
      const expandButton = screen.getByRole('button', { name: /expand district supervisors/i })
      
      // Initially collapsed
      expect(screen.queryByText('Test District Supervisor')).not.toBeInTheDocument()
      
      // Expand
      fireEvent.click(expandButton)
      expect(screen.getByText('Test District Supervisor')).toBeInTheDocument()
      
      // Collapse again
      const collapseButton = screen.getByRole('button', { name: /collapse district supervisors/i })
      fireEvent.click(collapseButton)
      expect(screen.queryByText('Test District Supervisor')).not.toBeInTheDocument()
    })
  })

  it('should show responsive grid layout for district supervisors', async () => {
    render(<Hierarchy />)
    
    await waitFor(() => {
      const expandButton = screen.getByRole('button', { name: /expand district supervisors/i })
      fireEvent.click(expandButton)
      
      const gridContainer = screen.getByTestId('district-supervisors-grid')
      expect(gridContainer).toHaveClass('grid')
      expect(gridContainer).toHaveClass('grid-cols-1')
      expect(gridContainer).toHaveClass('md:grid-cols-2')
      expect(gridContainer).toHaveClass('lg:grid-cols-3')
    })
  })

  it('should show hierarchy level indicators', async () => {
    render(<Hierarchy />)
    
    await waitFor(() => {
      expect(screen.getByText('Level 1')).toBeInTheDocument() // Founder
      expect(screen.getByText('Level 2')).toBeInTheDocument() // Current Acharya
      expect(screen.getByText('Level 3')).toBeInTheDocument() // Regional Directors
    })
  })
})