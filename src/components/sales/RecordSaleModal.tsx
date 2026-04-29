import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryDropdown } from "@/components/ui/CategoryDropdown";
import { motion } from "framer-motion";
import { X, ShoppingCart, IndianRupee, Calculator } from "lucide-react";
import {
  NewSaleEntry,
  SaleCategory,
  PaymentMethod,
  CATEGORY_GROUPS,
} from "@/lib/mock-data";



const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash", "UPI", "Card", "Net Banking", "Bank Transfer",
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface RecordSaleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (sale: Omit<NewSaleEntry, "id" | "date" | "totalAmount">) => void;
}

// ─── Form State ──────────────────────────────────────────────────────────────

interface FormState {
  productName: string;
  category: string;
  quantity: string;
  unitPrice: string;
  customerName: string;
  paymentMethod: string;
  notes: string;
}

interface FormErrors {
  productName?: string;
  category?: string;
  quantity?: string;
  unitPrice?: string;
  paymentMethod?: string;
}

const BLANK_FORM: FormState = {
  productName: "",
  category: "",
  quantity: "1",
  unitPrice: "",
  customerName: "",
  paymentMethod: "",
  notes: "",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function RecordSaleModal({ open, onClose, onSubmit }: RecordSaleModalProps) {
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form whenever modal opens
  useEffect(() => {
    if (open) {
      setForm(BLANK_FORM);
      setErrors({});
    }
  }, [open]);

  const qty = parseInt(form.quantity) || 0;
  const price = parseFloat(form.unitPrice) || 0;
  const totalAmount = qty * price;

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.productName.trim()) newErrors.productName = "Product name is required.";
    if (!form.category) newErrors.category = "Please select a category.";
    if (!form.quantity || qty < 1 || !Number.isInteger(qty))
      newErrors.quantity = "Enter a positive whole number.";
    if (!form.unitPrice || price <= 0)
      newErrors.unitPrice = "Enter a valid price greater than ₹0.";
    if (!form.paymentMethod) newErrors.paymentMethod = "Please select a payment method.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSubmit({
      productName: form.productName.trim(),
      category: form.category as SaleCategory,
      quantity: qty,
      unitPrice: price,
      customerName: form.customerName.trim() || "Walk-in Customer",
      paymentMethod: form.paymentMethod as PaymentMethod,
      notes: form.notes.trim(),
    });
    // Parent handles close
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <DialogHeader className="space-y-0">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <ShoppingCart className="h-4 w-4 text-primary-foreground" />
              </div>
              Record New Sale
            </DialogTitle>
          </DialogHeader>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-5 space-y-5"
        >
          {/* Row 1 — Product Name + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="productName" className="text-sm font-medium">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="productName"
                placeholder="e.g. RTX 4070, Ryzen 9 7950X"
                value={form.productName}
                onChange={(e) => set("productName", e.target.value)}
                className={errors.productName ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {errors.productName && (
                <p className="text-xs text-destructive mt-1">{errors.productName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Category <span className="text-destructive">*</span>
              </Label>
              <CategoryDropdown
                value={form.category}
                onChange={(v) => set("category", v)}
                triggerClassName={`w-full ${errors.category ? "border border-destructive" : ""}`}
                contentClassName="w-[240px]"
                showFilterIcon={false}
              />
              {errors.category && (
                <p className="text-xs text-destructive mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Row 2 — Quantity + Unit Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                step={1}
                placeholder="1"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                className={errors.quantity ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive mt-1">{errors.quantity}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unitPrice" className="text-sm font-medium">
                Unit Price (₹) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="unitPrice"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={form.unitPrice}
                  onChange={(e) => set("unitPrice", e.target.value)}
                  className={`pl-8 ${errors.unitPrice ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                />
              </div>
              {errors.unitPrice && (
                <p className="text-xs text-destructive mt-1">{errors.unitPrice}</p>
              )}
            </div>
          </div>

          {/* Row 3 — Total Amount (read-only) */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
              Total Amount
            </Label>
            <div className="flex items-center h-10 px-4 rounded-md border border-border bg-muted text-foreground font-mono text-sm font-semibold">
              ₹{totalAmount > 0 ? totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
              {totalAmount > 0 && (
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {qty} × ₹{price.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>

          {/* Row 4 — Customer Name + Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="customerName" className="text-sm font-medium">
                Customer Name
              </Label>
              <Input
                id="customerName"
                placeholder="Walk-in Customer"
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Payment Method <span className="text-destructive">*</span>
              </Label>
              <Select value={form.paymentMethod} onValueChange={(v) => set("paymentMethod", v)}>
                <SelectTrigger className={errors.paymentMethod ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentMethod && (
                <p className="text-xs text-destructive mt-1">{errors.paymentMethod}</p>
              )}
            </div>
          </div>

          {/* Row 5 — Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes <span className="text-muted-foreground text-xs font-normal">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Any additional details about this sale..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className="resize-none"
            />
          </div>
        </motion.div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-card">
          <div className="text-xs text-muted-foreground">
            {totalAmount > 0 && (
              <span className="text-primary font-medium">
                Sale value: ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="gradient-primary text-primary-foreground min-w-[120px]"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Save Sale
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
