import React, { Component } from "react";
import { Route, Routes } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { Layout } from "./components/Layout";
import "./custom.css";
import { queryClient } from "./lib/query-client.ts";
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { theme } from "./theme.ts";
import Dashboard from "./componentsNew/Dashboard.tsx";

export default class App extends Component {
  static displayName = App.name;

  render() {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Dashboard />
        <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
        {/* <Layout>
          <Routes>
            {AppRoutes.map((route, index) => {
              const { element, ...rest } = route;
              return <Route key={index} {...rest} element={element} />;
            })}
          </Routes>
        </Layout> */}
      </QueryClientProvider>
    );
  }
}
