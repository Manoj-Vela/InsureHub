
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Clients } from './components/Clients';
import { ClientDetail } from './components/ClientDetail';
import { AddClient } from './components/AddClient';
import { Policies } from './components/Policies';
import { PolicyDetail } from './components/PolicyDetail';
import { Documents } from './components/Documents';
import { Reminders } from './components/Reminders';
import { Insights } from './components/Insights';
import { SystemDesign } from './components/SystemDesign';
import { Login } from './components/Login';
import { TodaysWork } from './components/TodaysWork';
import { Settings } from './components/Settings';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

const AppRoutes: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/work" element={<TodaysWork />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/add" element={<AddClient />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/policies/:id" element={<PolicyDetail />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/architecture" element={<SystemDesign />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;
