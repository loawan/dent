import { useParams, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { usePatient, useUpdatePatient } from "@/hooks/use-patients";
import { useTreatments } from "@/hooks/use-treatments";
import { useInvoices } from "@/hooks/use-invoices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, AlertCircle, FileText, CreditCard, Printer, Image as ImageIcon, Plus, Upload } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { useState, useEffect, useRef } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PatientDetails() {
  const { id } = useParams();
  const patientId = id ? parseInt(id, 10) : NaN;
  const { data: patient, isLoading, isError } = usePatient(patientId);
  const { data: treatments } = useTreatments(patientId);
  const { data: invoices } = useInvoices();
  const [showAlert, setShowAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: xrays } = useQuery({
    queryKey: [api.xrays.list.path, patientId],
    queryFn: async () => {
      const res = await fetch(`${api.xrays.list.path}?patientId=${patientId}`);
      if (!res.ok) throw new Error("Failed to fetch xrays");
      return res.json();
    },
    enabled: !isNaN(patientId)
  });

  const uploadMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch(api.xrays.create.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, url })
      });
      if (!res.ok) throw new Error("Failed to save xray record");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.xrays.list.path, patientId] });
      toast({ title: "Success", description: "X-ray uploaded successfully" });
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast({ title: "Uploading...", description: "Please wait while we upload the X-ray." });
      
      // Step 1: Request presigned URL
      const response = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        }),
      });

      if (!response.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await response.json();

      // Step 2: Upload file directly to the presigned URL
      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      
      // Step 3: Save record in our DB
      // We use the objectPath to serve the file back later
      await uploadMutation.mutateAsync(objectPath);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    if (patient?.allergies && patient.allergies.trim() !== "") {
      setShowAlert(true);
    }
  }, [patient]);

  const patientInvoices = invoices?.filter(i => i.patientId === patientId) || [];

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <Layout><div className="flex items-center justify-center h-[50vh]">Loading...</div></Layout>;
  
  if (isError || !patient) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h2 className="text-2xl font-bold">Patient Not Found</h2>
          <p className="text-muted-foreground text-center">We couldn't find a patient with ID #{id}. They may have been deleted or the link is incorrect.</p>
          <Link href="/patients">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Patient List
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent className="border-red-200 bg-red-50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              MEDICAL ALERT: ALLERGIES
            </AlertDialogTitle>
            <AlertDialogDescription className="text-red-600 font-bold text-lg pt-4" asChild>
              <div>
                Patient {patient.name} has the following allergies:
                <div className="mt-2 p-4 bg-white border border-red-200 rounded-lg text-red-800 font-normal">
                  {patient.allergies}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700">I Understand</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-8 print:hidden">
        <Link href="/patients" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Patients
        </Link>
        
        <div className="flex justify-between items-start">
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-3xl font-display font-bold shadow-lg shadow-primary/25">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">{patient.name}</h1>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">Phone: <span className="text-foreground font-medium">{patient.phone}</span></span>
                <span>•</span>
                <span>ID: #{patient.id}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handlePrint}>
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold mb-2">Patient Report: {patient.name}</h1>
        <p className="text-sm">Patient ID: #{patient.id}</p>
        <p className="text-sm">Phone: {patient.phone}</p>
        <p className="text-sm">Medical History: {patient.medicalHistory || "None"}</p>
        <p className="text-sm">Allergies: {patient.allergies || "None"}</p>
        <hr className="my-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6 print:hidden">
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Medical Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Medical History</label>
                <p className="text-sm font-medium">{patient.medicalHistory || "None recorded"}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Allergies</label>
                {patient.allergies ? (
                  <Badge variant="destructive" className="gap-1 pl-1.5">
                    <AlertCircle className="w-3 h-3" />
                    {patient.allergies}
                  </Badge>
                ) : (
                  <p className="text-sm font-medium">None known</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                X-Ray Gallery
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*" 
                 onChange={handleFileUpload}
               />
               <div className="grid grid-cols-2 gap-2">
                 {xrays?.map((xray: any) => (
                   <div key={xray.id} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden group relative">
                     <img src={xray.url} alt="X-ray" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="icon" variant="ghost" className="text-white h-8 w-8" onClick={() => window.open(xray.url, '_blank')}>
                          <ImageIcon className="w-4 h-4" />
                        </Button>
                     </div>
                   </div>
                 ))}
                 <button 
                   className="aspect-square bg-primary/5 hover:bg-primary/10 rounded-lg flex flex-col items-center justify-center border border-dashed border-primary/30 transition-colors"
                   onClick={() => fileInputRef.current?.click()}
                 >
                   <Plus className="w-4 h-4 text-primary mb-1" />
                   <span className="text-[10px] font-medium text-primary">Upload</span>
                 </button>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="treatments" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 print:hidden">
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
              <TabsTrigger value="plans">Treatment Plan</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="treatments" className="space-y-4">
              <div className="flex justify-between items-center mb-4 print:hidden">
                <h3 className="font-semibold text-lg">Procedure Log</h3>
                <Link href="/treatments">
                  <Button size="sm" variant="outline">New Treatment</Button>
                </Link>
              </div>
              
              <div className="hidden print:block mb-4">
                <h3 className="font-bold text-lg">Treatment History</h3>
              </div>
              
              {treatments?.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-border text-muted-foreground">
                  No treatments recorded yet.
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden print:border-none print:shadow-none">
                  {treatments?.map((t, i) => (
                    <div key={t.id} className={`p-4 flex justify-between items-center ${i !== treatments.length - 1 ? 'border-b border-border' : ''}`}>
                      <div>
                        <h4 className="font-semibold text-foreground">{t.procedureName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Tooth: {t.toothNumber ? <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-foreground">{t.toothNumber}</span> : 'General'} • {t.notes || "No notes"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground">{t.cost} MMK</div>
                        <div className="text-xs text-muted-foreground">{t.date ? format(new Date(t.date), "MMM d, yyyy") : "-"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="plans" className="space-y-4">
              <div className="flex justify-between items-center mb-4 print:hidden">
                <h3 className="font-semibold text-lg">Treatment Plans</h3>
                <Button size="sm" variant="outline">Create Plan</Button>
              </div>
              <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No active treatment plans.</p>
                <p className="text-xs text-muted-foreground mt-1">Create a plan to track long-term procedures like Braces or Implants.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="billing" className="space-y-4">
              <div className="flex justify-between items-center mb-4 print:hidden">
                <h3 className="font-semibold text-lg">Invoices</h3>
                <Link href="/billing">
                  <Button size="sm" variant="outline">Create Invoice</Button>
                </Link>
              </div>

              <div className="hidden print:block mb-4">
                <h3 className="font-bold text-lg">Billing History</h3>
              </div>

              {patientInvoices.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-border text-muted-foreground">
                  No invoices generated.
                </div>
              ) : (
                <div className="space-y-3">
                  {patientInvoices.map(inv => (
                    <div key={inv.id} className="bg-white p-4 rounded-xl border border-border shadow-sm flex items-center justify-between print:border-none print:shadow-none print:border-b print:rounded-none">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500 print:hidden">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold">Invoice #{inv.id}</p>
                          <p className="text-xs text-muted-foreground">
                             Created {inv.createdAt ? format(new Date(inv.createdAt), "MMM d, yyyy") : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-6">
                         <div>
                            <p className="text-sm font-medium">Total: {inv.totalAmount} MMK</p>
                            <p className="text-xs text-muted-foreground">Paid: {inv.paidAmount} MMK</p>
                         </div>
                         <div className="print:hidden">
                           <StatusBadge status={inv.status} />
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
