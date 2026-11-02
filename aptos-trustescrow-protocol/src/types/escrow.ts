export type EscrowStatus = 'active' | 'completed' | 'disputed' | 'cancelled';
export type MilestoneStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'refunded';

export interface Milestone {
  id: number;
  title: string;
  description: string;
  amountApt: number;
  status: MilestoneStatus;
  proofUri?: string;
  submittedAt?: string;
  approvedAt?: string;
}

export interface Escrow {
  id: string;
  title: string;
  clientAddress: string;
  clientName: string;
  contractorAddress: string;
  contractorName: string;
  contractorAvatar?: string;
  arbitratorAddress: string;
  arbitratorName: string;
  arbitratorAvatar?: string;
  totalApt: number;
  releasedApt: number;
  status: EscrowStatus;
  createdAt: string;
  deadline: string;
  milestones: Milestone[];
  disputeReason?: string;
  arbitratorRuling?: {
    clientRefundApt: number;
    contractorPayoutApt: number;
    note: string;
    resolvedAt: string;
  };
}

export interface UserProfile {
  address: string;
  name: string;
  role: 'client' | 'contractor' | 'arbitrator';
  avatar: string;
  completedContracts: number;
  totalVolumeApt: number;
  rating: number; // 1.0 - 5.0
  reviewCount: number;
  disputeRate: number; // percentage
  badges: string[];
}

export interface MoveTestItem {
  id: string;
  name: string;
  module: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  gasUsed: number;
  durationMs: number;
  description: string;
}
