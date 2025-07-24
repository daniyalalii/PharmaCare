import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/components/layout/main-layout";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Billing from "@/pages/billing";
import Customers from "@/pages/customers";
import Prescriptions from "@/pages/prescriptions";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { LocalStorageManager } from "@/lib/localStorage";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/billing" component={Billing} />
      <Route path="/customers" component={Customers} />
      <Route path="/prescriptions" component={Prescriptions} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize localStorage data on app start
    LocalStorageManager.initializeSampleData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainLayout>
        <Router />
      </MainLayout>
      <Toaster />
    </div>
  );
}

export default App;
