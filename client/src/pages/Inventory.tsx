import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useInventory, useCreateInventoryItem, useUpdateInventoryItem } from "@/hooks/use-inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Minus, AlertTriangle, Edit, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clsx } from "clsx";
import { format } from "date-fns";

export default function Inventory() {
  const { data: items, isLoading } = useInventory();
  const updateItem = useUpdateInventoryItem();
  const [editItem, setEditItem] = useState<any>(null);

  const handlePrint = () => {
    window.print();
  };
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">Track medical supplies and stock levels.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print Inventory
          </Button>
          <CreateInventoryDialog />
        </div>
      </div>

      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">Inventory Report - SNC Dental Corporation</h1>
        <p className="text-sm">Generated on {format(new Date(), "PPP")}</p>
        <hr className="my-4" />
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden print:border-none print:shadow-none">
        <Table>
          <TableHeader className="bg-gray-50/50 print:bg-transparent">
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Cost/Unit</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right print:hidden">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={6} className="text-center py-8">Loading inventory...</TableCell></TableRow>
            ) : items?.length === 0 ? (
               <TableRow><TableCell colSpan={6} className="text-center py-8">Inventory is empty.</TableCell></TableRow>
            ) : (
               items?.map(item => {
                 const isLowStock = item.quantity <= item.minQuantity;
                 return (
                   <TableRow key={item.id} className="table-row-hover">
                     <TableCell className="font-medium">{item.name}</TableCell>
                     <TableCell className="text-muted-foreground text-sm">{item.unit}</TableCell>
                     <TableCell>{item.cost} MMK</TableCell>
                     <TableCell>
                       <div className="flex items-center gap-2">
                         <span className={clsx("font-bold", isLowStock ? "text-red-600" : "text-foreground")}>
                           {item.quantity}
                         </span>
                         <div className="print:hidden flex gap-1">
                           <RestockButton item={item} type="add" />
                           <RestockButton item={item} type="minus" />
                         </div>
                       </div>
                     </TableCell>
                     <TableCell>
                       {isLowStock ? (
                         <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                           <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock
                         </span>
                       ) : (
                         <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                           In Stock
                         </span>
                       )}
                     </TableCell>
                     <TableCell className="text-right print:hidden">
                       <UpdateStockDialog item={item} />
                     </TableCell>
                   </TableRow>
                 );
               })
            )}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}

function CreateInventoryDialog() {
  const [open, setOpen] = useState(false);
  const createItem = useCreateInventoryItem();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", quantity: "", minQuantity: "10", unit: "box", cost: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createItem.mutateAsync({
        name: formData.name,
        quantity: Number(formData.quantity),
        minQuantity: Number(formData.minQuantity),
        unit: formData.unit,
        cost: Number(formData.cost)
      });
      toast({ title: "Item Added" });
      setOpen(false);
      setFormData({ name: "", quantity: "", minQuantity: "10", unit: "box", cost: "" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Item Name</Label>
            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Latex Gloves" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Quantity</Label>
               <Input type="number" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
             </div>
             <div className="space-y-2">
               <Label>Min. Quantity</Label>
               <Input type="number" required value={formData.minQuantity} onChange={e => setFormData({...formData, minQuantity: e.target.value})} />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Unit</Label>
               <Input required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="box, piece..." />
             </div>
             <div className="space-y-2">
               <Label>Cost (MMK)</Label>
               <Input type="number" required value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
             </div>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={createItem.isPending}>Add Item</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UpdateStockDialog({ item }: { item: any }) {
  const [open, setOpen] = useState(false);
  const updateItem = useUpdateInventoryItem();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: item.name,
    quantity: String(item.quantity),
    minQuantity: String(item.minQuantity),
    unit: item.unit,
    cost: String(item.cost)
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateItem.mutateAsync({
        id: item.id,
        name: formData.name,
        quantity: Number(formData.quantity),
        minQuantity: Number(formData.minQuantity),
        unit: formData.unit,
        cost: Number(formData.cost)
      });
      toast({ title: "Item Updated" });
      setOpen(false);
    } catch(e: any) {
       toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>Edit Item Details</DialogTitle></DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Item Name</Label>
            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Min. Quantity</Label>
              <Input type="number" required value={formData.minQuantity} onChange={e => setFormData({...formData, minQuantity: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Cost (MMK)</Label>
              <Input type="number" required value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
            </div>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={updateItem.isPending}>Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RestockButton({ item, type = "add" }: { item: any, type?: "add" | "minus" }) {
  const [open, setOpen] = useState(false);
  const updateItem = useUpdateInventoryItem();
  const { toast } = useToast();
  const [qty, setQty] = useState("1");

  const handleUpdate = async () => {
    try {
      const change = Number(qty);
      const newQty = type === "add" ? item.quantity + change : Math.max(0, item.quantity - change);
      await updateItem.mutateAsync({ id: item.id, quantity: newQty });
      toast({ title: type === "add" ? `Added ${qty} to stock` : `Removed ${qty} from stock` });
      setOpen(false);
      setQty("1");
    } catch(e: any) {
       toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" className="h-6 w-6 rounded-full">
          {type === "add" ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[300px]">
        <DialogHeader><DialogTitle>{type === "add" ? "Add Stock" : "Remove Stock"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
           <div className="space-y-2">
             <Label>Amount to {type === "add" ? "Add" : "Remove"}</Label>
             <Input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} />
           </div>
           <Button onClick={handleUpdate} className="w-full" disabled={updateItem.isPending}>
             {type === "add" ? "Add to Stock" : "Remove from Stock"}
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
