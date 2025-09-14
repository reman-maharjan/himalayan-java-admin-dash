export interface Redeem {
  id: number
  redeem_points: number
  sub_category: number
  sub_category_name: string
  created_at: string
  updated_at: string
}

export interface UserRedeem {
  id: number
  redeem: number
  redeem_name: string
  points_used: number
  created_at: string
  updated_at: string
}

export interface UserRedeemWithDetails extends UserRedeem {
  user: {
    id: number
    full_name: string
    email: string
    phone?: string
    redeem_points: number
  }
  redeem_details: Redeem
}
