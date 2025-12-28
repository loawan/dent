import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useInvoices, useCreateInvoice, useUpdateInvoice } from "@/hooks/use-invoices";
import { usePatients } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, CreditCard, DollarSign, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Billing() {
  const { data: invoices, isLoading } = useInvoices();
  const updateInvoice = useUpdateInvoice();
  const { toast } = useToast();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const handlePrint = () => {
    window.print();
  };

  const handleAddPayment = async () => {
    if (!selectedInvoice) return;
    try {
      const newPaidAmount = Number(selectedInvoice.paidAmount) + Number(paymentAmount);
      const newStatus = newPaidAmount >= Number(selectedInvoice.totalAmount) ? "Paid" : "Partial";
      
      await updateInvoice.mutateAsync({
        id: selectedInvoice.id,
        paidAmount: newPaidAmount,
        status: newStatus
      });
      
      toast({ title: "Payment Recorded", description: `${paymentAmount} MMK added to invoice #${selectedInvoice.id}` });
      setPaymentDialogOpen(false);
      setPaymentAmount("");
      setSelectedInvoice(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const openPaymentDialog = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentDialogOpen(true);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground">Manage invoices and track payments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print Invoices
          </Button>
          <CreateInvoiceDialog />
        </div>
      </div>

      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">Invoices Report - SNC Dental Corporation</h1>
        <p className="text-sm">Generated on {format(new Date(), "PPP")}</p>
        <hr className="my-4" />
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden print:border-none print:shadow-none">
        <Table>
          <TableHeader className="bg-gray-50/50 print:bg-transparent">
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Patient ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right print:hidden">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : invoices?.length === 0 ? (
               <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No invoices found.</TableCell></TableRow>
            ) : (
               invoices?.map(inv => {
                 const balance = Number(inv.totalAmount) - Number(inv.paidAmount);
                 return (
                   <TableRow key={inv.id} className="table-row-hover">
                     <TableCell className="font-mono">#{inv.id}</TableCell>
                     <TableCell>#{inv.patientId}</TableCell>
                     <TableCell>{inv.createdAt ? format(new Date(inv.createdAt), "MMM d, yyyy") : "-"}</TableCell>
                     <TableCell className="font-medium">MMK{inv.totalAmount}</TableCell>
                     <TableCell className="text-green-600">MMK{inv.paidAmount}</TableCell>
                     <TableCell className="text-red-600 font-medium">MMK{balance.toFixed(2)}</TableCell>
                     <TableCell>
                       <div className="print:hidden">
                         <StatusBadge status={inv.status} />
                       </div>
                       <div className="hidden print:block text-xs font-bold">{inv.status}</div>
                     </TableCell>
                     <TableCell className="text-right print:hidden">
                       {inv.status !== "Paid" && (
                         <Button size="sm" variant="outline" className="h-8" onClick={() => openPaymentDialog(inv)}>
                           <DollarSign className="w-3 h-3 mr-1" /> Pay
                         </Button>
                       )}
                     </TableCell>
                   </TableRow>
                 );
               })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
           <DialogHeader>
             <DialogTitle>Add Payment</DialogTitle>
           </DialogHeader>
           <div className="space-y-4 py-4">
             <div className="p-4 bg-gray-50 rounded-lg border border-border">
               <div className="flex justify-between text-sm mb-2">
                 <span>Total Amount:</span>
                 <span className="font-medium">MMK{selectedInvoice?.totalAmount}</span>
               </div>
               <div className="flex justify-between text-sm mb-2">
                 <span>Already Paid:</span>
                 <span className="font-medium text-green-600">MMK{selectedInvoice?.paidAmount}</span>
               </div>
               <div className="flex justify-between font-bold border-t pt-2">
                 <span>Remaining Balance:</span>
                 <span className="text-red-600">MMK{(Number(selectedInvoice?.totalAmount) - Number(selectedInvoice?.paidAmount)).toFixed(2)}</span>
               </div>
             </div>
             
             <div className="space-y-2">
               <Label>Payment Amount (MMK)</Label>
               <Input 
                 type="number" 
                 value={paymentAmount} 
                 onChange={e => setPaymentAmount(e.target.value)} 
                 placeholder="Enter amount"
               />
             </div>
             
             <Button onClick={handleAddPayment} className="w-full">Confirm Payment</Button>
           </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function CreateInvoiceDialog() {
  const [open, setOpen] = useState(false);
  const { data: patients } = usePatients();
  const createInvoice = useCreateInvoice();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    patientId: "",
    totalAmount: "",
    paymentMethod: "Cash"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInvoice.mutateAsync({
        patientId: Number(formData.patientId),
        totalAmount: Number(formData.totalAmount),
        paymentMethod: formData.paymentMethod,
        status: "Unpaid"
      });
      toast({ title: "Invoice Created" });
      setOpen(false);
      setFormData({ patientId: "", totalAmount: "", paymentMethod: "Cash" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New Invoice</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Patient</Label>
            <Select onValueChange={v => setFormData({...formData, patientId: v})}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>
                {patients?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Total Amount (MMK)</Label>
            <Input type="number" required value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Payment Method</Label>
             <Select onValueChange={v => setFormData({...formData, paymentMethod: v})} defaultValue="Cash">
              <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="KBZ Pay">KBZ Pay</SelectItem>
                <SelectItem value="AYA Pay">AYA Pay</SelectItem>
                <SelectItem value="Mobile Banking">Mobile Banking</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={createInvoice.isPending}>Generate Invoice</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
