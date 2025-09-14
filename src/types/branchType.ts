export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  email?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BranchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Branch[];
}

export interface BranchRequest {
  name: string;
  address: string;
  phone: string;
  email?: string;
  is_active?: boolean;
}

interface BranchesTableProps {
  searchQuery?: string
  statusFilter?: string
  cityFilter?: string
  onDeleteBranch?: (branch: Branch) => void
}
