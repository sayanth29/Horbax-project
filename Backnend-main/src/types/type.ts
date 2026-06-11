// Response shape when login is successful
export interface AuthResponse {
  token: string
  username: string
}

// Shape of data decoded from a JWT token
export interface JwtPayload {
  id: string
  username: string
}


export interface Expense {
  _id:         string
  itemName:    string
  amount:      number
  category:    string
  expenseType: 'shop' | 'owner'   // 👈 add
  notes?:      string
  createdAt:   string
}