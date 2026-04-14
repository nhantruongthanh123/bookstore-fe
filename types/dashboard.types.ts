import { BookResponse } from './book.types';
import { OrderResponse } from './order.types';
import { CategoryResponse } from './category.types';

export interface DashboardResponse {
  totalActiveUsers: number;
  weeklyRevenue: number;
  orderInWeek: number;
  orderToday: number;
  alertBook: BookResponse | null;
  dailyRevenue: number[];
  recentOrders: OrderResponse[];
  topSellerBooks: BookResponse[];
  numberOfBooksInWeek: number[];
  topCategories: CategoryResponse[];
  percentOfTopCategories: number[];
}
