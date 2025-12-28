import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useAppointments, useCreateAppointment, useUpdateAppointment } from "@/hooks/use-appointments";
import { usePatients } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { format, isSameDay, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Clock, Plus, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Appointments() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const { data: appointments, isLoading } = useAppointments(); // fetch all for list, or filter client side for calendar simplicity
  const updateAppointment = useUpdateAppointment();
  const { toast } = useToast();

  const filteredAppointments = appointments?.filter(a => 
    isSameDay(parseISO(a.date as unknown as string), parseISO(date))
  ) || [];

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateAppointment.mutateAsync({ id, status });
      toast({ title: "Updated", description: `Appointment marked as MMK{status}` });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage clinic visits.</p>
        </div>
        <CreateAppointmentDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Simple Date Picker / Calendar Panel */}
        <div className="md:col-span-4 lg:col-span-3">
           <div className="bg-white rounded-xl border border-border p-6 shadow-sm sticky top-6">
             <h3 className="font-semibold mb-4 flex items-center gap-2">
               <CalendarIcon className="w-4 h-4 text-primary" />
               Select Date
             </h3>
             <Input 
               type="date" 
               value={date} 
               onChange={(e) => setDate(e.target.value)} 
               className="w-full"
             />
             <div className="mt-6 space-y-2">
                <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Summary</div>
                <div className="flex justify-between text-sm">
                   <span>Scheduled</span>
                   <span className="font-medium">{filteredAppointments.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span>Pending</span>
                   <span className="font-medium text-amber-600">
                     {filteredAppointments.filter(a => a.status === 'Pending').length}
                   </span>
                </div>
             </div>
           </div>
        </div>

        {/* Appointment List */}
        <div className="md:col-span-8 lg:col-span-9 space-y-4">
           {isLoading ? (
             <div className="text-center py-12">Loading schedule...</div>
           ) : filteredAppointments.length === 0 ? (
             <div className="bg-white rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                 <CalendarIcon className="w-6 h-6 text-gray-300" />
               </div>
               <p>No appointments scheduled for {format(parseISO(date), "MMMM d, yyyy")}</p>
             </div>
           ) : (
             filteredAppointments
               .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
               .map((apt) => (
               <div key={apt.id} className="bg-white rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 sm:items-center justify-between group">
                 <div className="flex items-start gap-4">
                   <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/5 text-primary border border-primary/10">
                     <span className="text-xs font-medium uppercase">{format(new Date(apt.date), "MMM")}</span>
                     <span className="text-xl font-bold">{format(new Date(apt.date), "d")}</span>
                   </div>
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <Clock className="w-3 h-3 text-muted-foreground" />
                       <span className="text-sm font-medium text-muted-foreground">
                         {format(new Date(apt.date), "h:mm a")}
                       </span>
                     </div>
                     <h4 className="font-bold text-lg text-foreground mb-1">Patient #{apt.patientId}</h4>
                     <p className="text-sm text-muted-foreground">{apt.notes || "No notes provided"}</p>
                   </div>
                 </div>

                 <div className="flex items-center gap-4 self-end sm:self-center">
                   <StatusBadge status={apt.status} />
                   
                   {apt.status === "Pending" && (
                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStatusChange(apt.id, "Completed")}>
                         <CheckCircle2 className="w-5 h-5" />
                       </Button>
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleStatusChange(apt.id, "Cancelled")}>
                         <XCircle className="w-5 h-5" />
                       </Button>
                     </div>
                   )}
                 </div>
               </div>
             ))
           )}
        </div>
      </div>
    </Layout>
  );
}

function CreateAppointmentDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createAppointment = useCreateAppointment();
  const { data: patients } = usePatients();
  
  const [formData, setFormData] = useState({
    patientId: "",
    date: "",
    time: "09:00",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dateTime = `MMK{formData.date}TMMK{formData.time}`;
      await createAppointment.mutateAsync({
        patientId: Number(formData.patientId),
        date: dateTime, // will be converted in hook
        status: "Pending",
        notes: formData.notes
      });
      toast({ title: "Success", description: "Appointment scheduled" });
      setOpen(false);
      setFormData({ patientId: "", date: "", time: "09:00", notes: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Patient</Label>
            <Select onValueChange={(val) => setFormData({...formData, patientId: val})}>
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients?.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
             <Label>Notes</Label>
             <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Reason for visit" />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={createAppointment.isPending}>
            Confirm Booking
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
