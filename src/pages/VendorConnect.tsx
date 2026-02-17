import { Star, Mail, Phone, MapPin } from "lucide-react";
import { vendors } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function VendorConnect() {
  const getStatusVariant = (status: string) => {
    if (status === 'Active') return 'default';
    if (status === 'Pending') return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">VendorConnect</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your supplier relationships
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{vendor.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  <span className="text-sm text-muted-foreground">
                    {vendor.rating}
                  </span>
                </div>
              </div>
              <Badge variant={getStatusVariant(vendor.status)}>
                {vendor.status}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {vendor.location}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {vendor.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                {vendor.phone}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {vendor.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-md"
                >
                  {specialty}
                </span>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1">
                Contact
              </Button>
              <Button size="sm" className="flex-1 gradient-primary border-0 text-primary-foreground">
                View Orders
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
