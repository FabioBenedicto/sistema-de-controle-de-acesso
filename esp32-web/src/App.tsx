import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { PrivateRoute } from './components/PrivateRoute.tsx';
import { UnauthenticatedRoute } from './components/UnauthenticatedRoute.tsx';
import { Cards } from './pages/Cards.tsx';
import { Classrooms } from './pages/Classrooms.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { Login } from './pages/Login.tsx';
import { Reserves } from './pages/Reserves.tsx';
import { Teachers } from './pages/Teachers.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <UnauthenticatedRoute>
              <Login />
            </UnauthenticatedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/salas"
          element={
            <PrivateRoute adminOnly>
              <Classrooms />
            </PrivateRoute>
          }
        ></Route>

        <Route
          path="/professores"
          element={
            <PrivateRoute adminOnly>
              <Teachers />
            </PrivateRoute>
          }
        />

        <Route
          path="/cartoes"
          element={
            <PrivateRoute adminOnly>
              <Cards />
            </PrivateRoute>
          }
        />

        <Route
          path="/reservas"
          element={
            <PrivateRoute>
              <Reserves />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<h2>404 - Página não encontrada</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
