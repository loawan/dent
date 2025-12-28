import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import PatientDetails from "@/pages/PatientDetails";
import Appointments from "@/pages/Appointments";
import Treatments from "@/pages/Treatments";
import Billing from "@/pages/Billing";
import Inventory from "@/pages/Inventory";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/patients" component={Patients} />
      <Route path="/patients/:id" component={PatientDetails} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/treatments" component={Treatments} />
      <Route path="/billing" component={Billing} />
      <Route path="/inventory" component={Inventory} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
