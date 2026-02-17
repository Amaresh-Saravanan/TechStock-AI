import { useQuery } from "@tanstack/react-query";
import { queryKeys, SalesHistoryResponse, api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, User, Package, IndianRupee } from "lucide-react";

export default function SalesDashboard() {
  const { data, isLoading } = useQuery<SalesHistoryResponse>({
    queryKey: queryKeys.salesHistory,
    queryFn: () => api.getSalesHistory(),
    staleTime: 60000,
  });

  const analytics = data?.analytics;
  const sales = data?.sales || [];
  const topSelling = data?.topSelling || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Sales Dashboard</h1>
      {isLoading ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-green-100">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-lg font-bold">₹{analytics?.totalRevenue?.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-100">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Profit</p>
                  <p className="text-lg font-bold">₹{analytics?.totalProfit?.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-yellow-100">
                  <Package className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Items Sold</p>
                  <p className="text-lg font-bold">{analytics?.totalItemsSold}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-100">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-lg font-bold">{analytics?.totalTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Selling Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {topSelling.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Sold: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs">Revenue: ₹{item.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Sold Price</th>
                  <th className="px-4 py-2 text-right">Profit</th>
                  <th className="px-4 py-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 12).map((sale) => (
                  <tr key={sale.id} className="border-b">
                    <td className="px-4 py-2">{sale.productName}</td>
                    <td className="px-4 py-2">{sale.customerName}</td>
                    <td className="px-4 py-2 text-right">{sale.quantity}</td>
                    <td className="px-4 py-2 text-right">₹{sale.soldPrice.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-green-600">₹{sale.profit.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">{new Date(sale.soldAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
