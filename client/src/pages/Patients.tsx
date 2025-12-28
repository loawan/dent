import { useState } from "react";
import { Layout } from "@/components/Layout";
import { usePatients, useCreatePatient } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, User, FileText } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function Patients() {
  const [search, setSearch] = useState("");
  const { data: patients, isLoading } = usePatients(search);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground">Manage patient records and history.</p>
        </div>
        <CreatePatientDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or phone..." 
              className="pl-9 bg-gray-50 border-gray-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading patients...</TableCell>
              </TableRow>
            ) : patients?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No patients found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              patients?.map((patient) => (
                <TableRow key={patient.id} className="table-row-hover group">
                  <TableCell className="font-mono text-xs text-muted-foreground">#{patient.id}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      {patient.name}
                    </div>
                  </TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {patient.createdAt ? format(new Date(patient.createdAt), "MMM d, yyyy") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/patients/${patient.id}`}>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5">
                        <FileText className="w-4 h-4 mr-2" />
                        View Record
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}

function CreatePatientDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const createPatient = useCreatePatient();
  const [formData, setFormData] = useState({ name: "", phone: "", medicalHistory: "", allergies: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPatient.mutateAsync(formData);
      toast({ title: "Success", description: "Patient created successfully" });
      onOpenChange(false);
      setFormData({ name: "", phone: "", medicalHistory: "", allergies: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 890" />
          </div>
          <div className="space-y-2">
            <Label>Medical History</Label>
            <Input value={formData.medicalHistory} onChange={e => setFormData({...formData, medicalHistory: e.target.value})} placeholder="e.g. Diabetes, Hypertension" />
          </div>
          <div className="space-y-2">
            <Label>Allergies</Label>
            <Input value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} placeholder="e.g. Penicillin, Latex" />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={createPatient.isPending}>
            {createPatient.isPending ? "Creating..." : "Create Patient Record"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
