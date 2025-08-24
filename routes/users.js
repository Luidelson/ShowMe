<Routes>
  <Route
    path="/profile"
    element={
      <ProtectedRoute isAuthenticated={(userIsLoggedIn = "false")}>
        <Profile />
      </ProtectedRoute>
    }
  />
  {/* other routes */}
</Routes>;
