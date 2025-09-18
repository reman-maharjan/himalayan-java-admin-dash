export interface Redeem {
  id: number
  redeem_points: number
  sub_category: number
  sub_category_name: string
  category_id: number
  category_name: string
  created_at: string
  updated_at: string
}

export interface UserRedeem {
  id: number
  redeem: Redeem   // <-- redeem is an object, not a number
  points_used: number
  created_at: string
  updated_at: string
}

export interface UserRedeemWithDetails extends UserRedeem {
  user_full_name: string
  user_email: string
  user_phone?: string
}
