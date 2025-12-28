import { useState } from "react";
import { Layout } from "@/components/Layout";
import { usePatients } from "@/hooks/use-patients";
import { useTreatments, useCreateTreatment } from "@/hooks/use-treatments";
import { Odontogram } from "@/components/Odontogram";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Save } from "lucide-react";

export default function Treatments() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  
  const { data: patients } = usePatients();
  const { data: treatments } = useTreatments(selectedPatientId ? Number(selectedPatientId) : undefined);
  const createTreatment = useCreateTreatment();
  const { toast } = useToast();

  // Form state
  const [procedure, setProcedure] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");

  const treatedTeeth = treatments?.map(t => t.toothNumber).filter(Boolean) as number[] || [];

  const handleSaveTreatment = async () => {
    if (!selectedPatientId || !procedure || !cost) {
      toast({ title: "Missing fields", description: "Select patient, procedure and enter cost.", variant: "destructive" });
      return;
    }
    
    try {
      await createTreatment.mutateAsync({
        patientId: Number(selectedPatientId),
        toothNumber: selectedTooth || undefined,
        procedureName: procedure,
        cost: Number(cost),
        notes: notes
      });
      toast({ title: "Success", description: "Treatment recorded." });
      // Reset form but keep patient selected
      setProcedure("");
      setCost("");
      setNotes("");
      setSelectedTooth(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Treatment & Odontogram</h1>
        <p className="text-muted-foreground">Visually manage patient dental records.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Selection & Form */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Select Patient</Label>
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Search patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients?.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPatientId && (
                <div className="pt-4 border-t border-border space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <PlusCircle className="w-4 h-4" />
                    New Procedure
                  </div>
                  
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Selected Tooth</p>
                    <div className="text-xl font-bold text-primary">
                      {selectedTooth ? `#${selectedTooth}` : "General / None"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Procedure Options</Label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { name: "Cleaning", cost: 30000 },
                        { name: "Filling", cost: 45000 },
                        { name: "Extraction", cost: 35000 },
                        { name: "RCT", cost: 150000 },
                      ].map((proc) => (
                        <Button 
                          key={proc.name} 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] h-7 px-2"
                          onClick={() => {
                            setProcedure(proc.name);
                            setCost(String(proc.cost));
                          }}
                        >
                          {proc.name}
                        </Button>
                      ))}
                    </div>
                    <Label>Procedure Name</Label>
                    <Input 
                      value={procedure} 
                      onChange={e => setProcedure(e.target.value)} 
                      placeholder="Type or select a procedure..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cost (MMK)</Label>
                    <Input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0.00" />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional details..." />
                  </div>

                  <Button className="w-full" onClick={handleSaveTreatment} disabled={createTreatment.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Record
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Odontogram */}
        <div className="lg:col-span-8">
          {selectedPatientId ? (
            <Odontogram 
              selectedTooth={selectedTooth}
              onSelectTooth={setSelectedTooth}
              treatedTeeth={treatedTeeth}
            />
          ) : (
            <div className="h-full min-h-[400px] flex items-center justify-center bg-gray-50 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">Select a patient to view their dental chart.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
